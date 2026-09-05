from pathlib import Path
import re

path = Path('/home/ubuntu/noor-work/src/utils/nativeNotifications.ts')
text = path.read_text()

voices = '''export const ADHAN_VOICES = [
  {
    id: "bundled-cc0",
    nameAr: "الأذان المرفق (يعمل دون إنترنت)",
    nameEn: "Bundled Adhan (Offline)",
    file: "adhan.wav",
  },
];

export interface NativePrayerScheduleDay {
  date: Date;
  prayers: Array<Pick<PrayerTime, "name" | "arabicName" | "time">>;
}
'''
text, count = re.subn(
    r'export const ADHAN_VOICES = \[.*?^\];\n',
    voices,
    text,
    count=1,
    flags=re.S | re.M,
)
if count != 1:
    raise SystemExit('voice list block not found')

text = text.replace(
'''export const scheduleAllNativeNotifications = async (
  prayers: PrayerTime[],
  settings: AppSettings,
) => {''',
'''export const scheduleAllNativeNotifications = async (
  prayers: PrayerTime[],
  settings: AppSettings,
  scheduleDays: NativePrayerScheduleDay[] = [{ date: new Date(), prayers }],
) => {''')

text = text.replace(
'''    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + dayOffset);

      prayers.forEach((prayer) => {''',
'''    for (const scheduleDay of scheduleDays) {
      const targetDate = new Date(scheduleDay.date);
      targetDate.setHours(12, 0, 0, 0);

      scheduleDay.prayers.forEach((prayer) => {''')

text = text.replace('''              category: "CRITICAL_ADHAN_CATEGORY", // iOS Critical Alert custom category
              critical: true, // Native iOS & Android critical notification flag
              volume: 1.0,
''', '')

# Add a native test notification function before the scheduler.
marker = '/**\n * Schedule Native Background Lock-screen Push Notifications'
test_function = '''/**
 * Schedules a short native test notification. This is used by the settings
 * screen instead of the browser Notification API when the app runs natively.
 */
export const scheduleNativeTestNotification = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const id = Math.floor(Date.now() % 1000000000);
    await LocalNotifications.schedule({
      notifications: [{
        id,
        title: "نور الإسلام | اختبار ناجح",
        body: "تم تشغيل إشعار الاختبار بصوت الأذان المحلي المرفق.",
        schedule: { at: new Date(Date.now() + 2000) },
        sound: "adhan.wav",
        channelId: "adhan_channel",
        extra: { type: "test" },
      }],
    });
    return true;
  } catch (error) {
    console.error("Failed to schedule native test notification:", error);
    return false;
  }
};

'''
text = text.replace(marker, test_function + marker, 1)
path.write_text(text)
print('patched', path)
''
