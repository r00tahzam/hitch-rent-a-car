import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function sendBookingConfirmation(carName: string, days: number, total: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Booking Confirmed!',
      body: `${carName} is booked for ${days} day${days !== 1 ? 's' : ''}. Total: PKR ${total.toLocaleString()}`,
      sound: true,
    },
    trigger: null,
  });
}

export async function scheduleBookingReminder(carName: string, startDate: string) {
  const start = new Date(startDate);
  const reminderDate = new Date(start);
  reminderDate.setDate(reminderDate.getDate() - 1);
  reminderDate.setHours(8, 0, 0, 0);

  if (reminderDate <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Rental Reminder',
      body: `Your ${carName} rental starts tomorrow! Make sure you're ready.`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });
}
