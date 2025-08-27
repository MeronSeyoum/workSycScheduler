import { ClientAddress } from "./client";

// Base QR Code type
export interface QRCode {
  id: number;
  client_id: number;
  code_value: string;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
 client?: {
    id: number;
    business_name: string;
    email: string;
    contact_person?: string;
    location_address?: ClientAddress;
  };
}

// For QR code creation
export interface QRCodeCreateParams {
  client_id: number;
  expires_at?: Date;
}

// For QR code updates
export interface QRCodeUpdateParams {
  expires_at?: Date;
}

// QR code validation response
export interface QRCodeValidationResponse {
  valid: boolean;
  qr_code?: QRCode;
  error?: string;
}

// Paginated response for QR codes
export interface PaginatedQRCodeResponse {
  data: QRCode[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}