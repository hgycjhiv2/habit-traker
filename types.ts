export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  // Dates are stored as YYYY-MM-DD strings
  completedDates: string[];
  createdAt: string;
  reminderTime?: string; // HH:MM 24h format
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export enum ViewState {
  HOME = 'HOME',
  STATS = 'STATS',
  PLANNER = 'PLANNER',
}

export interface DayData {
  date: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue, etc.
  dayNumber: number;
  isToday: boolean;
}