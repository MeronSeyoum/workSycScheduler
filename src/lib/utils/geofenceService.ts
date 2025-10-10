// lib/services/geofenceService.ts
import { Geofence } from '@/lib/types/geofence';

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLng = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Check if a coordinate is within a geofence
 */
export const isCoordinateInGeofence = (
  coordinate: Coordinates,
  geofence: Geofence
): boolean => {
  const geofenceCenter: Coordinates = {
    latitude: geofence.latitude,
    longitude: geofence.longitude,
  };

  const distanceKm = calculateDistance(coordinate, geofenceCenter);
  const radiusKm = geofence.radius_meters / 1000;

  return distanceKm <= radiusKm;
};

/**
 * Check if two geofences overlap
 */
export const doGeofencesOverlap = (
  geofence1: Geofence,
  geofence2: Geofence
): boolean => {
  const center1: Coordinates = {
    latitude: geofence1.latitude,
    longitude: geofence1.longitude,
  };

  const center2: Coordinates = {
    latitude: geofence2.latitude,
    longitude: geofence2.longitude,
  };

  const distance = calculateDistance(center1, center2);
  const combinedRadius = (geofence1.radius_meters + geofence2.radius_meters) / 1000;

  return distance <= combinedRadius;
};

/**
 * Get all geofences that a coordinate is inside
 */
export const getGeofencesContainingCoordinate = (
  coordinate: Coordinates,
  geofences: Geofence[]
): Geofence[] => {
  return geofences.filter((geofence) =>
    isCoordinateInGeofence(coordinate, geofence)
  );
};

/**
 * Find nearby geofences within a certain distance
 */
export const findNearbyGeofences = (
  coordinate: Coordinates,
  geofences: Geofence[],
  radiusKm: number
): Geofence[] => {
  return geofences.filter((geofence) => {
    const geofenceCenter: Coordinates = {
      latitude: geofence.latitude,
      longitude: geofence.longitude,
    };

    const distance = calculateDistance(coordinate, geofenceCenter);
    return distance <= radiusKm;
  });
};

/**
 * Calculate the bounds of a geofence (approximate)
 */
export const calculateGeofenceBounds = (geofence: Geofence) => {
  // Rough approximation: 1 degree ≈ 111 km
  const latOffset = geofence.radius_meters / 111000;
  const lngOffset = geofence.radius_meters / (111000 * Math.cos((geofence.latitude * Math.PI) / 180));

  return {
    north: geofence.latitude + latOffset,
    south: geofence.latitude - latOffset,
    east: geofence.longitude + lngOffset,
    west: geofence.longitude - lngOffset,
  };
};

/**
 * Format geofence data for API submission
 */
export const formatGeofenceForSubmission = (data: any) => {
  return {
    client_id: parseInt(data.client_id),
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
    radius_meters: parseInt(data.radius_meters),
    accuracy: data.accuracy ? parseInt(data.accuracy) : 95,
    status: data.status || 'active',
  };
};

/**
 * Validate geofence data
 */
export const validateGeofenceData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.client_id) {
    errors.push('Client ID is required');
  }

  if (data.latitude === undefined || data.latitude === null) {
    errors.push('Latitude is required');
  } else if (data.latitude < -90 || data.latitude > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (data.longitude === undefined || data.longitude === null) {
    errors.push('Longitude is required');
  } else if (data.longitude < -180 || data.longitude > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  if (!data.radius_meters) {
    errors.push('Radius is required');
  } else if (data.radius_meters < 10 || data.radius_meters > 5000) {
    errors.push('Radius must be between 10 and 5000 meters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Group geofences by client
 */
export const groupGeofencesByClient = (
  geofences: Geofence[]
): Record<number, Geofence[]> => {
  return geofences.reduce(
    (acc, geofence) => {
      if (!acc[geofence.client_id]) {
        acc[geofence.client_id] = [];
      }
      acc[geofence.client_id].push(geofence);
      return acc;
    },
    {} as Record<number, Geofence[]>
  );
};

/**
 * Calculate coverage statistics
 */
export const calculateCoverageStats = (geofences: Geofence[]) => {
  const totalArea = geofences.reduce((sum, geofence) => {
    const radiusKm = geofence.radius_meters / 1000;
    return sum + Math.PI * radiusKm * radiusKm;
  }, 0);

  const avgRadius = geofences.length > 0
    ? geofences.reduce((sum, g) => sum + g.radius_meters, 0) / geofences.length
    : 0;

  return {
    totalCount: geofences.length,
    totalArea, // km²
    avgRadius, // meters
    totalRadius: geofences.reduce((sum, g) => sum + g.radius_meters, 0),
  };
};

/**
 * Generate geofence report
 */
export const generateGeofenceReport = (
  geofences: Geofence[],
  clients: any[]
) => {
  const grouped = groupGeofencesByClient(geofences);
  const stats = calculateCoverageStats(geofences);

  const report = Object.entries(grouped).map(([clientId, clientGeofences]) => {
    const client = clients.find((c) => c.id === parseInt(clientId));
    const clientStats = calculateCoverageStats(clientGeofences);

    return {
      client_id: parseInt(clientId),
      client_name: client?.business_name || 'Unknown',
      geofence_count: clientStats.totalCount,
      total_area_km2: parseFloat(clientStats.totalArea.toFixed(2)),
      avg_radius_m: parseFloat(clientStats.avgRadius.toFixed(2)),
    };
  });

  return {
    summary: {
      total_geofences: stats.totalCount,
      total_coverage_km2: parseFloat(stats.totalArea.toFixed(2)),
      avg_radius_m: parseFloat(stats.avgRadius.toFixed(2)),
    },
    by_client: report,
  };
};