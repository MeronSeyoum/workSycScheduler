export interface Location {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  client_id: string; // Reference to the Client this location belongs to
  type: 'commercial' | 'residential';
  status: 'active' | 'inactive' | 'on_hold';
  qr_code?: string; // Optional field for QR code identifier
  coordinates?: {
    lat: number;
    lng: number;
  };
  contact?: {
    phone: string;
    email: string;
  };
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}