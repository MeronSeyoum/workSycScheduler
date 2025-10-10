// AdvancedMapPicker.tsx
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Button,
  Input,
  Row,
  Col,
  Card,
  Tag,
  Spin,
  InputNumber,
  Tooltip,
  Divider, message
} from 'antd';
import {
  SearchOutlined,
  CopyOutlined,
  ReloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  EnvironmentFilled,
} from '@ant-design/icons';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface AdvancedMapPickerProps {
  visible: boolean;
  onConfirm: (latitude: number, longitude: number) => void;
  onCancel: () => void;
  initialLatitude?: number;
  initialLongitude?: number;
  radiusMeters?: number;
  showRadius?: boolean;
  title?: string;
}

export const AdvancedMapPicker: React.FC<AdvancedMapPickerProps> = ({
  visible,
  onConfirm,
  onCancel,
  initialLatitude =  51.0447,
  initialLongitude = -114.0719,
  radiusMeters = 500,
  showRadius = true,
  title = 'Select Location on Map',
}) => {
  const [selectedLat, setSelectedLat] = useState(initialLatitude);
  const [selectedLng, setSelectedLng] = useState(initialLongitude);
  const [selectedRadius, setSelectedRadius] = useState(radiusMeters);
  const [searchAddress, setSearchAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [mapInitialized, setMapInitialized] = useState(false);

  const {
    mapRef,
    markerRef,
    mapReady,
    isGoogleMapsLoaded,
    initializeMap,
    addMarker,
    onMarkerDrag,
    onMapClick,
    drawGeofence,
    panToCoordinates,
    geocodeAddress,
    reverseGeocodeCoordinates,
    cleanup,
  } = useGoogleMaps();

  // ADD THE MISSING FUNCTIONS HERE:
  const handleZoomIn = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || 13;
      mapRef.current.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || 13;
      mapRef.current.setZoom(Math.max(currentZoom - 1, 1));
    }
  };

  const handleCopyCoordinates = () => {
    const text = `${selectedLat.toFixed(6)}, ${selectedLng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    message.success('Coordinates copied to clipboard');
  };

  const handleResetLocation = () => {
    setSelectedLat(initialLatitude);
    setSelectedLng(initialLongitude);
    setSelectedRadius(radiusMeters);
    
    if (mapRef.current) {
      panToCoordinates({
        latitude: initialLatitude,
        longitude: initialLongitude,
      });

      // Update marker position
      if (markerRef.current) {
        markerRef.current.setPosition({
          lat: initialLatitude,
          lng: initialLongitude
        });
      }

      if (showRadius) {
        drawGeofence(
          { latitude: initialLatitude, longitude: initialLongitude },
          radiusMeters
        );
      }
    }

    message.info('Location reset to initial position');
  };

  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) {
      message.warning('Please enter an address');
      return;
    }

    setLoading(true);
    try {
      const coords = await geocodeAddress(searchAddress);
      if (coords) {
        setSelectedLat(coords.latitude);
        setSelectedLng(coords.longitude);
        
        if (mapRef.current) {
          panToCoordinates(coords, 15);
        }

        // Update marker position
        if (markerRef.current) {
          markerRef.current.setPosition({
            lat: coords.latitude,
            lng: coords.longitude
          });
        }

        if (showRadius) {
          drawGeofence(coords, selectedRadius);
        }

        const addr = await reverseGeocodeCoordinates(coords);
        setAddress(addr || '');
        message.success('Location found');
      } else {
        message.error('Address not found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      message.error('Error geocoding address');
    } finally {
      setLoading(false);
    }
  };

  // Improved map initialization
  useEffect(() => {
    if (visible && isGoogleMapsLoaded() && !mapInitialized) {
      setMapLoading(true);
      
      const initializeMapWithRetry = (retryCount = 0) => {
        const container = document.getElementById('advanced-map-picker');
        
        if (!container) {
          console.error('Map container not found');
          setMapLoading(false);
          return;
        }

        // Check if container is visible and has dimensions
        const isContainerVisible = container.offsetWidth > 0 && container.offsetHeight > 0;
        
        if (!isContainerVisible && retryCount < 5) {
          console.log(`Container not ready, retrying... (${retryCount + 1}/5)`);
          setTimeout(() => initializeMapWithRetry(retryCount + 1), 200);
          return;
        }

        if (!isContainerVisible) {
          console.error('Map container not visible after retries');
          setMapLoading(false);
          return;
        }

        try {
          // Initialize map
          const map = initializeMap('advanced-map-picker', {
            latitude: selectedLat,
            longitude: selectedLng,
          }, {
            zoom: 15,
            fullscreenControl: true,
            mapTypeControl: true,
            streetViewControl: false,
            zoomControl: true,
          });

          if (!map) {
            throw new Error('Failed to initialize map');
          }

          // Add marker
          const marker = addMarker(
            { latitude: selectedLat, longitude: selectedLng },
            true,
            'Geofence Center'
          );

          // Draw geofence if enabled
          if (showRadius && marker) {
            drawGeofence(
              { latitude: selectedLat, longitude: selectedLng },
              selectedRadius
            );
          }

          // Setup event listeners
          if (marker) {
            onMarkerDrag((coords) => {
              setSelectedLat(coords.latitude);
              setSelectedLng(coords.longitude);
              if (showRadius) {
                drawGeofence(coords, selectedRadius);
              }
              reverseGeocodeCoordinates(coords).then((addr) => {
                if (addr) setAddress(addr);
              });
            });
          }

          onMapClick((coords) => {
            setSelectedLat(coords.latitude);
            setSelectedLng(coords.longitude);
            if (showRadius) {
              drawGeofence(coords, selectedRadius);
            }
            reverseGeocodeCoordinates(coords).then((addr) => {
              if (addr) setAddress(addr);
            });
          });

          // Get initial address
          reverseGeocodeCoordinates({
            latitude: selectedLat,
            longitude: selectedLng,
          }).then((addr) => {
            if (addr) setAddress(addr);
          });

          setMapInitialized(true);
          setMapLoading(false);
          console.log('✓ Map initialized successfully');
        } catch (error) {
          console.error('Map initialization error:', error);
          setMapLoading(false);
        }
      };

      // Start initialization
      initializeMapWithRetry();
    }

    return () => {
      if (!visible) {
        cleanup();
        setMapInitialized(false);
      }
    };
  }, [visible, isGoogleMapsLoaded(), mapInitialized]);

  // Reset initialization when modal closes
  useEffect(() => {
    if (!visible) {
      setMapInitialized(false);
    }
  }, [visible]);

  // Handle coordinates changes
  useEffect(() => {
    if (mapReady && markerRef.current) {
      const newPosition = new google.maps.LatLng(selectedLat, selectedLng);
      markerRef.current.setPosition(newPosition);
      if (showRadius) {
        drawGeofence(
          { latitude: selectedLat, longitude: selectedLng },
          selectedRadius
        );
      }
    }
  }, [selectedLat, selectedLng, mapReady]);

  // Redraw geofence when radius changes
  useEffect(() => {
    if (mapReady && showRadius && markerRef.current) {
      drawGeofence(
        { latitude: selectedLat, longitude: selectedLng },
        selectedRadius
      );
    }
  }, [selectedRadius, mapReady, showRadius]);

  // Add a fallback for when Google Maps fails to load
  if (!isGoogleMapsLoaded() && visible) {
    return (
      <Modal
        title={title}
        open={visible}
        onCancel={onCancel}
        width="85vw"
        style={{ maxWidth: '1200px' }}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            Cancel
          </Button>,
        ]}
      >
        <div className="text-center py-8">
          <Spin size="large" />
          <p className="mt-4">Loading Google Maps...</p>
          <p className="text-sm text-gray-500">
            If this takes too long, please check your internet connection and try again.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      width="85vw"
      style={{ maxWidth: '1200px' }}
      styles={{ body: { padding: '16px', height: '60vh', minHeight: '400px' } }}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={() => {
            onConfirm(selectedLat, selectedLng);
            onCancel();
          }}
          style={{ backgroundColor: '#0F6973', borderColor: '#0F6973' }}
          disabled={mapLoading}
        >
          {mapLoading ? 'Loading...' : 'Confirm Location'}
        </Button>,
      ]}
    >
      <Spin spinning={mapLoading} tip="Initializing map...">
        <Row gutter={16} style={{ height: '100%' }}>
          {/* Map Container */}
          <Col xs={24} md={16} style={{ height: '100%' }}>
            <div
              id="advanced-map-picker"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                position: 'relative',
                minHeight: '500px',
              }}
            />

            {/* Map Controls */}
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <Tooltip title="Zoom In">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<ZoomInOutlined />}
                  onClick={handleZoomIn}
                  style={{ backgroundColor: '#0F6973', borderColor: '#0F6973' }}
                />
              </Tooltip>
              <Tooltip title="Zoom Out">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<ZoomOutOutlined />}
                  onClick={handleZoomOut}
                  style={{ backgroundColor: '#0F6973', borderColor: '#0F6973' }}
                />
              </Tooltip>
              <Tooltip title="Reset Location">
                <Button
                  type="default"
                  shape="circle"
                  icon={<ReloadOutlined />}
                  onClick={handleResetLocation}
                />
              </Tooltip>
            </div>
          </Col>

          {/* Control Panel */}
          <Col xs={24} md={8} style={{ height: '100%', overflowY: 'auto' }}>
            <Card size="small" title="Location Controls" style={{ marginBottom: '16px' }}>
              <div className="space-y-4">
                {/* Search by Address */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    <SearchOutlined /> Search Address
                  </label>
                  <Input.Search
                    placeholder="Enter address"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    onSearch={handleSearchAddress}
                    loading={loading}
                    enterButton={<SearchOutlined />}
                    size="small"
                  />
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {/* Coordinates */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    <EnvironmentFilled /> Coordinates
                  </label>
                  <Row gutter={8}>
                    <Col span={12}>
                      <div>
                        <span className="text-xs text-gray-600">Latitude</span>
                        <InputNumber
                          value={selectedLat}
                          onChange={(val) => val !== null && setSelectedLat(val)}
                          precision={6}
                          step={0.0001}
                          style={{ width: '100%' }}
                          size="small"
                        />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div>
                        <span className="text-xs text-gray-600">Longitude</span>
                        <InputNumber
                          value={selectedLng}
                          onChange={(val) => val !== null && setSelectedLng(val)}
                          precision={6}
                          step={0.0001}
                          style={{ width: '100%' }}
                          size="small"
                        />
                      </div>
                    </Col>
                  </Row>
                  <Button
                    size="small"
                    block
                    icon={<CopyOutlined />}
                    onClick={handleCopyCoordinates}
                    style={{ marginTop: '8px' }}
                  >
                    Copy Coordinates
                  </Button>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {/* Radius (if enabled) */}
                {showRadius && (
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Radius: <Tag color="blue">{selectedRadius}m</Tag>
                    </label>
                    <InputNumber
                      value={selectedRadius}
                      onChange={(val) => val !== null && setSelectedRadius(val)}
                      min={10}
                      max={5000}
                      step={10}
                      style={{ width: '100%' }}
                      size="small"
                    />
                  </div>
                )}

                <Divider style={{ margin: '12px 0' }} />

                {/* Address Display */}
                {address && (
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Address
                    </label>
                    <Card size="small" style={{ backgroundColor: '#f8f9fa' }}>
                      <p className="text-sm text-gray-700 break-words m-0">
                        {address}
                      </p>
                    </Card>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </Modal>
  );
};