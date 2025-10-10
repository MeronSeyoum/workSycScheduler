// components/Dashboard/MapPicker/GeofenceViewerModal.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  Button,
  Row,
  Col,
  Card,
  Tag,
  Spin,
  Descriptions,
  Divider,
  Typography,
  Space,
  Alert,
  Statistic, 
  message
} from 'antd';
import {
  RadarChartOutlined,
  UserOutlined,
  CopyOutlined,
  CloseOutlined,
  AimOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { Geofence } from '@/lib/types/geofence';
import { Client } from '@/lib/types/client';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface GeofenceViewerModalProps {
  visible: boolean;
  onClose: () => void;
  geofence: Geofence | null;
  client?: Client;
}

export const GeofenceViewerModal: React.FC<GeofenceViewerModalProps> = ({
  visible,
  onClose,
  geofence,
  client,
}) => {
  const [mapLoading, setMapLoading] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string>('');
  const modalRef = useRef<boolean>(false);

  const {
    mapRef,
    markerRef,
    mapReady,
    isGoogleMapsLoaded,
    initializeMap,
    addMarker,
    drawGeofence,
    panToCoordinates,
    reverseGeocodeCoordinates,
    cleanup,
  } = useGoogleMaps();

  // Convert string coordinates to numbers
  const getNumericCoordinates = (geofence: Geofence) => {
    const latitude = typeof geofence.latitude === 'string' 
      ? parseFloat(geofence.latitude) 
      : geofence.latitude;
    
    const longitude = typeof geofence.longitude === 'string'
      ? parseFloat(geofence.longitude)
      : geofence.longitude;

    // Validate the conversion
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error(`Invalid coordinates: cannot convert to numbers. Lat: ${geofence.latitude}, Lng: ${geofence.longitude}`);
    }

    return { latitude, longitude };
  };

  // Initialize map when modal opens
  useEffect(() => {
    if (visible && geofence && isGoogleMapsLoaded() && !mapInitialized) {
      console.log('Starting map initialization...');
      setMapLoading(true);
      setMapError('');
      modalRef.current = true;
      
      try {
        // Convert coordinates to numbers
        const numericCoords = getNumericCoordinates(geofence);
        console.log('Converted coordinates:', numericCoords);
      } catch (error) {
        const errorMsg = `Coordinate conversion error: ${error}`;
        console.error(errorMsg);
        setMapError(errorMsg);
        setMapLoading(false);
        return;
      }

      const initializeMapWithRetry = (retryCount = 0) => {
        // Check if modal is still open
        if (!modalRef.current) {
          console.log('Modal closed during initialization');
          return;
        }

        const container = document.getElementById('geofence-viewer-map');
        
        if (!container) {
          const errorMsg = 'Map container not found';
          console.error(errorMsg);
          setMapError(errorMsg);
          setMapLoading(false);
          return;
        }

        // Force container dimensions
        container.style.minHeight = '400px';
        container.style.height = '100%';
        container.style.width = '100%';
        container.style.backgroundColor = '#f5f5f5';
        
        const isContainerVisible = container.offsetWidth > 0 && container.offsetHeight > 0;
        
        console.log('Container dimensions:', {
          width: container.offsetWidth,
          height: container.offsetHeight,
          visible: isContainerVisible
        });

        if (!isContainerVisible && retryCount < 10) {
          console.log(`Container not ready, retrying... (${retryCount + 1}/10)`);
          setTimeout(() => initializeMapWithRetry(retryCount + 1), 300);
          return;
        }

        if (!isContainerVisible) {
          const errorMsg = 'Map container not visible after retries';
          console.error(errorMsg);
          setMapError(errorMsg);
          setMapLoading(false);
          return;
        }

        try {
          // Convert coordinates to numbers
          const numericCoords = getNumericCoordinates(geofence);
          
          console.log('Initializing Google Map with numeric coordinates:', numericCoords);
          
          // Initialize map with read-only options
          const map = initializeMap('geofence-viewer-map', numericCoords, {
            zoom: 15,
            fullscreenControl: true,
            mapTypeControl: true,
            streetViewControl: false,
            zoomControl: true,
          });

          if (!map) {
            throw new Error('Failed to initialize map - initializeMap returned null');
          }

          // Wait for map to be ready before adding elements
          const initMapElements = () => {
            // Check if modal is still open
            if (!modalRef.current) {
              console.log('Modal closed during map element initialization');
              return;
            }

            console.log('Map initialized, adding marker and geofence...');

            // Add marker (non-draggable for read-only)
            const marker = addMarker(
              numericCoords,
              false, // NOT draggable
              `${client?.business_name || 'Geofence'} Center`
            );

            if (!marker) {
              console.warn('Marker not created');
            }

            // Draw geofence circle
            const circle = drawGeofence(
              numericCoords,
              geofence.radius_meters,
              {
                strokeColor: '#0F6973',
                strokeOpacity: 0.8,
                strokeWeight: 3,
                fillColor: '#0F6973',
                fillOpacity: 0.15,
                editable: false,
                draggable: false,
              }
            );

            if (!circle) {
              console.warn('Circle not drawn');
            }

            // Get address for the location
            reverseGeocodeCoordinates(numericCoords)
              .then((addr) => {
                if (!modalRef.current) return; // Skip if modal closed
                console.log('Address result:', addr);
                if (addr) setAddress(addr);
              })
              .catch(error => {
                console.error('Reverse geocoding error:', error);
              });

            setMapInitialized(true);
            setMapLoading(false);
            console.log('✓ Geofence viewer map initialized successfully');
          };

          // Wait for map to be ready
          if (mapReady) {
            initMapElements();
          } else {
            // Listen for map ready event
            google.maps.event.addListenerOnce(map, 'idle', () => {
              initMapElements();
            });
          }

        } catch (error) {
          const errorMsg = `Map initialization error: ${error}`;
          console.error(errorMsg);
          setMapError(errorMsg);
          setMapLoading(false);
        }
      };

      // Start initialization with a small delay to ensure DOM is ready
      setTimeout(() => initializeMapWithRetry(), 100);
    }

    return () => {
      if (!visible) {
        console.log('Cleaning up map...');
        modalRef.current = false;
        cleanup();
        setMapInitialized(false);
        setMapError('');
      }
    };
  }, [visible, geofence, isGoogleMapsLoaded(), mapInitialized, mapReady]);

  // Reset when modal closes
  useEffect(() => {
    if (!visible) {
      modalRef.current = false;
      setMapInitialized(false);
      setAddress('');
      setMapError('');
    }
  }, [visible]);

  const handleCopyCoordinates = () => {
    if (geofence) {
      const text = `${geofence.latitude}, ${geofence.longitude}`;
      navigator.clipboard.writeText(text);
      message.success('Coordinates copied to clipboard');
    }
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      message.success('Address copied to clipboard');
    }
  };

  const handleClose = () => {
    modalRef.current = false;
    onClose();
  };

  if (!geofence) return null;

  // Convert coordinates for display
  const numericCoords = getNumericCoordinates(geofence);
  const area = Math.round(Math.PI * Math.pow(geofence.radius_meters, 2));
  const areaKm2 = area / 1000000;

  return (
    <Modal
      title={
        <Space>
          <AimOutlined />
          <span>Geofence Location</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      width="90vw"
      style={{ maxWidth: '1400px' }}
      styles={{
        body: {
          padding: '16px', 
          height: '75vh', 
          minHeight: '500px',
        }
      }}
      footer={[
        <Button key="close" onClick={handleClose} icon={<CloseOutlined />}>
          Close
        </Button>,
      ]}
      destroyOnHidden
    >
      <Spin 
        spinning={mapLoading} 
        tip={mapError ? `Error: ${mapError}` : "Loading map..."}
        size="large"
      >
        <Row gutter={16} style={{ height: '100%' }}>
          {/* Map Container - Larger */}
          <Col xs={24} lg={16} style={{ height: '100%' }}>
            <div
              id="geofence-viewer-map"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '8px',
                border: '1px solid #d9d9d9',
                position: 'relative',
                minHeight: '660px',
                backgroundColor: mapLoading ? '#f5f5f5' : 'transparent',
              }}
            >
              {/* Fallback content if map fails to load */}
              {mapError && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  color: '#999',
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  <EnvironmentOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <div>Failed to load map</div>
                  <div style={{ fontSize: '12px', marginTop: '8px' }}>{mapError}</div>
                  <Button 
                    type="primary" 
                    onClick={() => window.location.reload()}
                    style={{ marginTop: '16px' }}
                  >
                    Retry
                  </Button>
                </div>
              )}
              
              {!mapError && !mapInitialized && !mapLoading && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  color: '#999'
                }}>
                  <div>Map not initialized</div>
                </div>
              )}
            </div>
          </Col>

          {/* Information Panel */}
          <Col xs={24} lg={8} style={{ height: '100%', overflowY: 'auto' }}>
            <div className="space-y-4">
              {/* Header */}
              <Card size="small" style={{ backgroundColor: '#f8f9fa' }}>
                <Title level={4} style={{ margin: 0, color: '#0F6973' }}>
                  {client?.business_name || 'Geofence Details'}
                </Title>
                <Text type="secondary">
                  {client?.contact_person || 'Client geofence'}
                </Text>
              </Card>

              {/* Status & Basic Info */}
              <Card size="small" title="Status & Information">
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {/* <div className="flex justify-between items-center">
                    <Tag
                      color={geofence.status === 'active' ? 'green' : 'orange'}
                      icon={<RadarChartOutlined />}
                    >
                      {geofence.status?.toUpperCase() || 'ACTIVE'}
                    </Tag>
                    <Statistic
                      value={geofence.radius_meters}
                      suffix="m"
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </div>
                  
                  <Divider style={{ margin: '8px 0' }} /> */}
                  
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Coverage Area">
                      {areaKm2 >= 1 
                        ? `${areaKm2.toFixed(2)} km²` 
                        : `${area.toLocaleString()} m²`
                      }
                    </Descriptions.Item>
                    <Descriptions.Item label="Created">
                      {dayjs(geofence.created_at).format('MMM D, YYYY h:mm A')}
                    </Descriptions.Item>
                    {geofence.updated_at && (
                      <Descriptions.Item label="Last Updated">
                        {dayjs(geofence.updated_at).format('MMM D, YYYY h:mm A')}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Space>
              </Card>

              {/* Coordinates */}
              <Card size="small" title="Location Coordinates">
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                    <div>Lat: {numericCoords.latitude}</div>
                    <div>Lng: {numericCoords.longitude}</div>
                  </div>
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    onClick={handleCopyCoordinates}
                    block
                  >
                    Copy Coordinates
                  </Button>
                </Space>
              </Card>

              {/* Address */}
              {address && (
                <Card size="small" title="Address">
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <Text style={{ fontSize: '12px', lineHeight: '1.4' }}>
                      {address}
                    </Text>
                    <Button
                      icon={<CopyOutlined />}
                      size="small"
                      onClick={handleCopyAddress}
                      block
                    >
                      Copy Address
                    </Button>
                  </Space>
                </Card>
              )}

              {/* Client Information */}
              {client && (
                <Card size="small" title="Client Information">
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div className="flex items-center gap-2">
                      <UserOutlined style={{ color: '#0F6973' }} />
                      <Text strong>{client.business_name}</Text>
                    </div>
                    {client.contact_person && (
                      <Text type="secondary">Contact: {client.contact_person}</Text>
                    )}
                    {client.email && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Email: {client.email}
                      </Text>
                    )}
                  </Space>
                </Card>
              )}

        

              {/* Help Text */}
              {/* <Alert
                message="View Only"
                description="This is a read-only view of the geofence location. Use the map to pan and zoom around the area."
                type="info"
                showIcon
                size="small"
              /> */}
            </div>
          </Col>
        </Row>
      </Spin>
    </Modal>
  );
};