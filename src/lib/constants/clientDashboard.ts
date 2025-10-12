// constants/dashboard.ts
export const CLIENT_STATUS_COLOR_MAP = {
  active: "#52c41a",
  inactive:  "#8c8c8c",
  on_hold: "#fa541c",
} as const;

export const GEOFENCE_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Testing', value: 'testing' },
] as const;

export const VIEW_MODES = {
  TABLE: 'table',
  CARD: 'card',
} as const;

export const TABS = {
  CLIENTS: 'clients',
  QRCODES: 'qrcodes',
  GEOFENCES: 'geofences',
} as const;