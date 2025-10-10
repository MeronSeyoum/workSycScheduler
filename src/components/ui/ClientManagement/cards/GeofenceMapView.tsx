// src/components/ui/ClientManagement/cards/GeofenceMapView.tsx
import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Select, Checkbox, Spin, Empty, message, Row, Col, Statistic, Tag } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, EnvironmentOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Geofence } from '@/lib/types/geofence';
import { Client } from '@/lib/types/client';
import { useGoogleMaps }  from '@/hooks/useGoogleMaps';
import { calculateCoverageStats, groupGeofencesByClient } from '@/lib/utils/geofenceService';

interface GeofenceMapViewProps {
  geofences: Geofence[];
  clients: Client[];
  onEdit?: (geofence: Geofence) => void;
  onDelete?: (geofence: Geofence) => void;
}

const GEOFENCE_COLORS = [
  '#0F6973',
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#95E1D3',
  '#F38181',
  '#AA96DA',
  '#FCBAD3',
];

export const GeofenceMapView: React.FC<GeofenceMapViewProps> = ({
  geofences,
  clients,
  onEdit,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [visibleGeofences, setVisibleGeofences] = useState<Set<number>>(new Set());
  const [mapInitialized, setMapInitialized] = useState(false);

  const {
    mapRef,
    isGoogleMapsLoaded,
    initializeMap,
    drawGeofence,
    fitToBounds,
    cleanup,
  } = useGoogleMaps();

  const circlesRef = React.useRef<Map<number, google.maps.Circle>>(new Map());
  const markersRef = React.useRef<Map<number, google.maps.Marker>>(new Map());

  // Filter geofences based on selected clients
  const filteredGeofences = selectedClients.length > 0
    ? geofences.filter((g) => selectedClients.includes(g.client_id))
    : geofences;

  // Initialize map on component mount
  useEffect(() => {
    if (!isGoogleMapsLoaded()) return;

    setLoading(true);

    // Get center point of all geofences
    if (geofences.length > 0) {
      const avgLat = geofences.reduce((sum, g) => sum + g.latitude, 0) / geofences.length;
      const avgLng = geofences.reduce((sum, g) => sum + g.longitude, 0) / geofences.length;

      initializeMap('geofence-map-view', {
        latitude: avgLat,
        longitude: avgLng,
      });

      setMapInitialized(true);
      setLoading(false);
    } else {
      // Default map
      initializeMap('geofence-map-view', {
        latitude: 51.0447,
        longitude: -114.0719,
      });
      setMapInitialized(false);
      setLoading(false);
    }

    return () => {
      cleanup();
    };
  }, [isGoogleMapsLoaded()]);

  // Draw geofences on map
  useEffect(() => {
    if (!mapInitialized || !mapRef.current) return;

    // Clear existing circles and markers
    circlesRef.current.forEach((circle) => circle.setMap(null));
    markersRef.current.forEach((marker) => marker.setMap(null));
    circlesRef.current.clear();
    markersRef.current.clear();

    // Draw filtered geofences
    filteredGeofences.forEach((geofence, index) => {
      if (visibleGeofences.size === 0 || visibleGeofences.has(geofence.id)) {
        const client = clients.find((c) => c.id === geofence.client_id);
        const color = GEOFENCE_COLORS[index % GEOFENCE_COLORS.length];

        // Draw circle
        const circle = drawGeofence(
          { latitude: geofence.latitude, longitude: geofence.longitude },
          geofence.radius_meters,
          {
            strokeColor: color,
            fillColor: color,
            strokeOpacity: 0.8,
            fillOpacity: 0.15,
            strokeWeight: 2,
          }
        );

        if (circle) {
          circlesRef.current.set(geofence.id, circle);

          // Add click listener to circle
          circle.addListener('click', () => {
            // Show info window or selection
            console.log('Geofence clicked:', geofence);
          });
        }

        // Add marker
        if (mapRef.current && isGoogleMapsLoaded()) {
          const marker = new google.maps.Marker({
            position: {
              lat: geofence.latitude,
              lng: geofence.longitude,
            },
            map: mapRef.current,
            title: `${client?.business_name} - ${geofence.radius_meters}m`,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            },
          });

          markersRef.current.set(geofence.id, marker);
        }
      }
    });

    // Fit bounds to visible geofences
    if (filteredGeofences.length > 0) {
      fitToBounds(
        filteredGeofences.map((g) => ({
          latitude: g.latitude,
          longitude: g.longitude,
        }))
      );
    }
  }, [
    filteredGeofences,
    visibleGeofences,
    mapInitialized,
    mapRef.current,
    isGoogleMapsLoaded(),
  ]);

  const handleSelectClient = (clientIds: number[]) => {
    setSelectedClients(clientIds);
  };

  const handleToggleGeofenceVisibility = (geofenceId: number) => {
    const newVisible = new Set(visibleGeofences);
    if (newVisible.has(geofenceId)) {
      newVisible.delete(geofenceId);
    } else {
      newVisible.add(geofenceId);
    }
    setVisibleGeofences(newVisible);
  };

  const handleShowAllGeofences = () => {
    const allIds = new Set(filteredGeofences.map((g) => g.id));
    setVisibleGeofences(allIds);
  };

  const handleHideAllGeofences = () => {
    setVisibleGeofences(new Set());
  };

  const stats = calculateCoverageStats(filteredGeofences);
  const grouped = groupGeofencesByClient(filteredGeofences);

  return (
    <Card
      title={
        <Space>
          <EnvironmentOutlined />
          <span>Geofence Map View</span>
        </Space>
      }
      extra={
        <Space>
          <Button size="small" onClick={handleShowAllGeofences}>
            <EyeOutlined /> Show All
          </Button>
          <Button size="small" onClick={handleHideAllGeofences} danger>
            <EyeInvisibleOutlined /> Hide All
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading} tip="Loading map...">
        <Row gutter={16}>
          {/* Map */}
          <Col xs={24} lg={16}>
            <div
              id="geofence-map-view"
              style={{
                width: '100%',
                height: '600px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                marginBottom: '16px',
              }}
            />
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {/* Statistics */}
              <Card size="small" title="Coverage Statistics" style={{ marginBottom: '16px' }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Geofences"
                      value={stats.totalCount}
                      prefix={<EnvironmentOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Total Area"
                      value={stats.totalArea}
                      precision={2}
                      suffix="km²"
                    />
                  </Col>
                </Row>
              </Card>

              {/* Client Filter */}
              <Card size="small" title="Filter by Client" style={{ marginBottom: '16px' }}>
                <Select
                  mode="multiple"
                  placeholder="Select clients"
                  value={selectedClients}
                  onChange={handleSelectClient}
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                >
                  {clients.map((client) => (
                    <Select.Option key={client.id} value={client.id}>
                      {client.business_name}
                    </Select.Option>
                  ))}
                </Select>
              </Card>

              {/* Geofence List */}
              <Card
                size="small"
                title={`Geofences (${filteredGeofences.length})`}
                style={{ marginBottom: '16px' }}
              >
                {filteredGeofences.length === 0 ? (
                  <Empty description="No geofences" />
                ) : (
                  <div className="space-y-2">
                    {filteredGeofences.map((geofence, index) => {
                      const client = clients.find((c) => c.id === geofence.client_id);
                      const color = GEOFENCE_COLORS[index % GEOFENCE_COLORS.length];
                      const isVisible = visibleGeofences.size === 0 || visibleGeofences.has(geofence.id);

                      return (
                        <div
                          key={geofence.id}
                          style={{
                            padding: '12px',
                            border: `1px solid ${color}`,
                            borderRadius: '4px',
                            backgroundColor: `${color}10`,
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={isVisible}
                                onChange={() =>
                                  handleToggleGeofenceVisibility(geofence.id)
                                }
                              />
                              <div
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  backgroundColor: color,
                                  borderRadius: '2px',
                                }}
                              />
                              <span className="font-medium text-sm">
                                {client?.business_name}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-gray-600 mb-2">
                            <div>
                              Coordinates: {geofence.latitude.toFixed(4)},{' '}
                              {geofence.longitude.toFixed(4)}
                            </div>
                            <div>Radius: {geofence.radius_meters}m</div>
                          </div>

                          <div className="flex gap-2">
                            {onEdit && (
                              <Button
                                size="small"
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => onEdit(geofence)}
                              />
                            )}
                            {onDelete && (
                              <Button
                                size="small"
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => onDelete(geofence)}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </Col>
        </Row>
      </Spin>
    </Card>
  );
};