import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'hitch_analytics_events';

export type AnalyticsEvent = {
  name: string;
  data?: Record<string, string | number | boolean>;
  timestamp: number;
};

export async function trackEvent(
  name: string,
  data?: Record<string, string | number | boolean>
) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    events.push({ name, data, timestamp: Date.now() });
    // Keep last 500 events to avoid unbounded growth
    const trimmed = events.slice(-500);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Analytics should never crash the app
  }
}

export async function getEventCount(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    return events.length;
  } catch {
    return 0;
  }
}

export async function getEventSummary(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    const summary: Record<string, number> = {};
    for (const ev of events) {
      summary[ev.name] = (summary[ev.name] ?? 0) + 1;
    }
    return summary;
  } catch {
    return {};
  }
}
