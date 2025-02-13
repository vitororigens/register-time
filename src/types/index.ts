export interface Employee {
  id: string;
  name: string;
  department: string;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  taskName: string;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: number; // in minutes
}

export interface MonthlyReport {
  employeeId: string;
  month: number;
  year: number;
  totalHours: number;
  status: 'open' | 'closed';
}