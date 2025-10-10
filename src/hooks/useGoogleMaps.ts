import {  useRef, useState, useCallback } from 'react';

interface MapOptions {
  zoom?: number;
  mapType?: google.maps.MapTypeId;
  fullscreenControl?: boolean;
  mapTypeControl?: boolean;
  streetViewControl?: boolean;
  zoomControl?: boolean;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

export const useGoogleMaps = () => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [currentCoordinates, setCurrentCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if Google Maps API is loaded - INCLUDING GEOMETRY LIBRARY
  const isGoogleMapsLoaded = useCallback(() => {
    const mapsLoaded = typeof google !== 'undefined' && google.maps;
    const geometryLoaded = mapsLoaded && google.maps.geometry;
    
    if (mapsLoaded && !geometryLoaded) {
      console.warn('Maps loaded but geometry library missing. Add &libraries=geometry to script');
    }
    
    return mapsLoaded && geometryLoaded;
  }, []);


    const getMapState = useCallback(() => ({
    mapReady,
    currentCoordinates,
    loading,
    hasMap: !!mapRef.current,
    hasMarker: !!markerRef.current,
  }), [mapReady, currentCoordinates, loading]);


  // Initialize map
 const initializeMap = useCallback(
  (containerId: string, coordinates: Coordinates, options: MapOptions = {}) => {
      if (!isGoogleMapsLoaded()) {
        console.error('Google Maps API not loaded');
        return null;
      }

      setLoading(true);
      
      try {
        const container = document.getElementById(containerId);
        if (!container) {
          throw new Error(`Container #${containerId} not found`);
        }

        // Force container to have dimensions
        container.style.minHeight = '400px';
        
        const mapOptions: google.maps.MapOptions = {
          zoom: options.zoom || 13,
          center: { 
            lat: coordinates.latitude || 51.0447, 
            lng: coordinates.longitude || -114.0719 
          },
          mapTypeId: options.mapType || google.maps.MapTypeId.ROADMAP,
          fullscreenControl: options.fullscreenControl !== false,
          mapTypeControl: options.mapTypeControl !== false,
          streetViewControl: options.streetViewControl !== false,
          zoomControl: options.zoomControl !== false,
          gestureHandling: 'greedy',
        };

        const map = new google.maps.Map(container, mapOptions);
        
        // Wait for map to be ready
        google.maps.event.addListenerOnce(map, 'idle', () => {
          setMapReady(true);
          setLoading(false);
          setCurrentCoordinates(coordinates);
        });

        mapRef.current = map;
        return map;
      } catch (error) {
        console.error('Map initialization failed:', error);
        setLoading(false);
        return null;
      }
    },
    [isGoogleMapsLoaded]
);

  // Add marker
  const addMarker = useCallback(
    (coordinates: Coordinates, draggable = true, title = 'Geofence Center') => {
      if (!mapRef.current || !isGoogleMapsLoaded()) {
        return;
      }

      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      const marker = new google.maps.Marker({
        position: { lat: coordinates.latitude, lng: coordinates.longitude },
        map: mapRef.current,
        draggable,
        animation: google.maps.Animation.DROP,
        title,
      });

      markerRef.current = marker;
      setCurrentCoordinates(coordinates);
      return marker;
    },
    [isGoogleMapsLoaded]
  );

  // Drag listener
  const onMarkerDrag = useCallback(
    (callback: (coordinates: Coordinates) => void) => {
      if (!markerRef.current) return;

      markerRef.current.addListener('dragend', () => {
        const position = markerRef.current?.getPosition();
        if (position) {
          const coords = {
            latitude: parseFloat(position.lat().toFixed(6)),
            longitude: parseFloat(position.lng().toFixed(6)),
          };
          setCurrentCoordinates(coords);
          callback(coords);
        }
      });
    },
    []
  );

  // Click listener
  const onMapClick = useCallback(
    (callback: (coordinates: Coordinates) => void) => {
      if (!mapRef.current || !markerRef.current) return;

      mapRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          markerRef.current?.setPosition(e.latLng);
          const coords = {
            latitude: parseFloat(e.latLng.lat().toFixed(6)),
            longitude: parseFloat(e.latLng.lng().toFixed(6)),
          };
          setCurrentCoordinates(coords);
          callback(coords);
        }
      });
    },
    []
  );

  // Draw geofence
  const drawGeofence = useCallback(
    (coordinates: Coordinates, radiusMeters: number, options: google.maps.CircleOptions = {}) => {
      if (!mapRef.current || !isGoogleMapsLoaded()) return;

      if (circleRef.current) {
        circleRef.current.setMap(null);
      }

      const circle = new google.maps.Circle({
        center: { lat: coordinates.latitude, lng: coordinates.longitude },
        radius: radiusMeters,
        map: mapRef.current,
        strokeColor: '#0F6973',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#0F6973',
        fillOpacity: 0.15,
        editable: false,
        draggable: false,
        ...options,
      });

      circleRef.current = circle;
      return circle;
    },
    [isGoogleMapsLoaded]
  );

  // Pan to coordinates
  const panToCoordinates = useCallback(
    (coordinates: Coordinates, zoom?: number) => {
      if (!mapRef.current) return;

      mapRef.current.panTo({
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      });

      if (zoom !== undefined) {
        mapRef.current.setZoom(zoom);
      }
    },
    []
  );

  // FIXED: Geocode address to coordinates
  const geocodeAddress = useCallback(
    async (address: string): Promise<Coordinates | null> => {
      if (!isGoogleMapsLoaded()) {
        console.error('Google Maps not loaded');
        return null;
      }

      if (!address || address.trim() === '') {
        console.error('Address is empty');
        return null;
      }

      return new Promise((resolve) => {
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ address: address.trim() }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            const location = results[0].geometry.location;
            const coords: Coordinates = {
              latitude: parseFloat(location.lat().toFixed(6)),
              longitude: parseFloat(location.lng().toFixed(6)),
            };
            console.log('✓ Geocoded address:', address, 'to:', coords);
            resolve(coords);
          } else {
            console.error('✗ Geocoding failed:', status, 'Address:', address);
            resolve(null);
          }
        });
      });
    },
    [isGoogleMapsLoaded]
  );

  // FIXED: Reverse geocode coordinates to address
  const reverseGeocodeCoordinates = useCallback(
    async (coordinates: Coordinates): Promise<string | null> => {
      if (!isGoogleMapsLoaded()) {
        console.error('Google Maps not loaded');
        return null;
      }

      return new Promise((resolve) => {
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode(
          {
            location: {
              lat: coordinates.latitude,
              lng: coordinates.longitude,
            },
          },
          (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
              const address = results[0].formatted_address;
              console.log('✓ Reverse geocoded coords:', coordinates, 'to:', address);
              resolve(address);
            } else {
              console.error('✗ Reverse geocoding failed:', status, 'Coords:', coordinates);
              resolve(null);
            }
          }
        );
      });
    },
    [isGoogleMapsLoaded]
  );

  // Calculate distance (now works because geometry library is included)
  const calculateDistance = useCallback(
    (coords1: Coordinates, coords2: Coordinates): number => {
      if (!isGoogleMapsLoaded()) {
        console.error('Geometry library not loaded');
        return 0;
      }

      try {
        const from = new google.maps.LatLng(coords1.latitude, coords1.longitude);
        const to = new google.maps.LatLng(coords2.latitude, coords2.longitude);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(from, to);
        return distance / 1000; // Convert to km
      } catch (error) {
        console.error('Distance calculation error:', error);
        return 0;
      }
    },
    [isGoogleMapsLoaded]
  );

  // Get viewport bounds
  const getViewportBounds = useCallback(() => {
    if (!mapRef.current) return null;

    const bounds = mapRef.current.getBounds();
    if (!bounds) return null;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    return {
      northeast: { latitude: ne.lat(), longitude: ne.lng() },
      southwest: { latitude: sw.lat(), longitude: sw.lng() },
    };
  }, []);

  // Fit bounds
  const fitToBounds = useCallback(
    (coordinates: Coordinates[]) => {
      if (!mapRef.current || !isGoogleMapsLoaded() || coordinates.length === 0) return;

      const bounds = new google.maps.LatLngBounds();
      coordinates.forEach((coord) => {
        bounds.extend({
          lat: coord.latitude,
          lng: coord.longitude,
        });
      });

      mapRef.current.fitBounds(bounds);
    },
    [isGoogleMapsLoaded]
  );

  // Cleanup
  const cleanup = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }
    if (mapRef.current) {
      mapRef.current = null;
    }
    setMapReady(false);
  }, []);

  return {
   // Refs
    mapRef,
    markerRef,
    circleRef,
    // States (now accessible)
    mapReady,
    currentCoordinates,
    loading,
    // State getter
    getMapState,
    // Methods
    isGoogleMapsLoaded,
    initializeMap,
    addMarker,
    onMarkerDrag,
    onMapClick,
    drawGeofence,
    panToCoordinates,
    geocodeAddress,
    reverseGeocodeCoordinates,
    calculateDistance,
    getViewportBounds,
    fitToBounds,
    cleanup,
  };
};