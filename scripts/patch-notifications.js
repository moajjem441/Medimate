const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(
  __dirname,
  '../node_modules/expo-notifications/build/warnOfExpoGoPushUsage.js'
);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  // Replace throw new Error(message) with console.warn(message)
  if (content.includes("throw new Error(message);")) {
    content = content.replace(
      "throw new Error(message);",
      "didWarn = true; console.warn(message);"
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('✅ Successfully patched expo-notifications for Expo Go on Android');
  }
} else {
  console.log('ℹ️ expo-notifications target file not found, skipping patch');
}
