export interface Geofence {
  id: number;
  client_id: number;
  latitude: number;
  longitude: number;
  radius_meters: number;
  created_at?: string;
  updated_at?: string;
  client?: {
    id: number;
    business_name: string;
    email: string;
    status: string;
  };
}