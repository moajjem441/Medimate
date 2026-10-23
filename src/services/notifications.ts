import { Platform } from 'react-native';

let Notifications: any = null;

try {
  Notifications = require('expo-notifications');
  if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch (err) {
  console.warn(
    '[NotificationService] expo-notifications module unavailable in current environment:',
    err
  );
}

export class NotificationService {
  /**
   * Request permissions for push/local alerts
   */
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web' || !Notifications) return false;

    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      if (Platform.OS === 'android' && Notifications.setNotificationChannelAsync) {
        await Notifications.setNotificationChannelAsync('medicine-reminders', {
          name: 'Medicine Reminders',
          importance: Notifications.AndroidImportance?.MAX ?? 4,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0D9488',
          sound: 'default',
        });
      }

      return true;
    } catch (err) {
      console.warn('[NotificationService] Permission check error:', err);
      return false;
    }
  }

  /**
   * Parse time string (e.g. "08:30 AM" or "14:00") into { hour, minute }
   */
  static parseTimeString(timeStr: string): { hour: number; minute: number } {
    const trimmed = timeStr.trim().toUpperCase();
    const isPM = trimmed.includes('PM');
    const isAM = trimmed.includes('AM');

    const clean = trimmed.replace('AM', '').replace('PM', '').trim();
    const parts = clean.split(':');
    let hour = parseInt(parts[0], 10) || 8;
    const minute = parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0;

    if (isPM && hour < 12) {
      hour += 12;
    } else if (isAM && hour === 12) {
      hour = 0;
    }

    return { hour, minute };
  }

  /**
   * Schedule a recurring daily local medicine notification
   */
  static async scheduleMedicineReminder(
    medicineName: string,
    dosage: string,
    timeStr: string,
    timingInstructions?: string
  ): Promise<string | null> {
    if (Platform.OS === 'web' || !Notifications) return null;

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const { hour, minute } = this.parseTimeString(timeStr);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ Time for your medicine: ${medicineName}`,
          body: `${dosage} - ${timingInstructions || 'Take as prescribed by your doctor.'}`,
          sound: 'default',
          data: { medicineName, dosage, timeStr },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes?.DAILY || 'daily',
          hour,
          minute,
          channelId: 'medicine-reminders',
        },
      });

      return notificationId;
    } catch (err) {
      console.warn('[NotificationService] Notification scheduling skipped:', err);
      return null;
    }
  }

  /**
   * Cancel an existing scheduled notification
   */
  static async cancelReminder(notificationId: string): Promise<void> {
    if (Platform.OS === 'web' || !notificationId || !Notifications) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (err) {
      console.warn('[NotificationService] Notification cancel error:', err);
    }
  }
}
