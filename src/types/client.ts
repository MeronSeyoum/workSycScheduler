// types/client.ts

export interface ClientAddress {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}
export type ClientStatus = 'active' | 'inactive' | 'on_hold';

export interface Client {
  id: number;
  business_name: string;
  email: string;
  phone?: string | null;
  contact_person?: string | null;
  location_address?: ClientAddress | null;
  geo_latitude?: number | null;
  geo_longitude?: number | null;
  status: 'active' | 'inactive' | 'on_hold';
  notes?: string | null;
  created_at?: Date;
  updated_at?: Date;
}