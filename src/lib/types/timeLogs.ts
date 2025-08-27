export interface TimeLog {
  id: string;
  employeeName: string;
  clockIn: string;
  clockOut?: string;
  duration?: string;
  status: 'active' | 'inactive';
  location?: {
    lat: number;
    lng: number;
  };
}