"use client";

// File structure for the refactored components:
/*
src/
├── components/
│   └── Dashboard/
│       ├── ClientManagementDashboard.tsx          # Main dashboard component
│       ├── tabs/
│       │   ├── ClientManagementTab.tsx            # Client tab component
│       │   ├── QRCodeManagementTab.tsx            # QR Code tab component
│       │   └── GeofenceManagementTab.tsx          # Geofence tab component
│       ├── forms/
│       │   ├── ClientForm.tsx                     # Extracted from original
│       │   ├── QRCodeForm.tsx                     # Extracted from original
│       │   └── ModernGeofenceForm.tsx             # Extracted from original
│       ├── cards/
│       │   └── EnhancedGeofenceCard.tsx           # Extracted from original
│       ├── columns/
│       │   ├── clientColumns.tsx                  # Table column definitions
│       │   ├── qrCodeColumns.tsx                  # Table column definitions
│       │   └── geofenceColumns.tsx                # Table column definitions
│       └── modals/
│           ├── ClientDrawer.tsx                   # Modal wrapper components
│           ├── QRCodeDrawer.tsx                   # Modal wrapper components
│           ├── GeofenceModal.tsx                  # Modal wrapper components
│           └── QRCodePreviewModal.tsx             # Extracted from original
├── hooks/
│   ├── useClientData.ts                           # Client data management
│   ├── useQRCodeData.ts                          # QR Code data management
│   ├── useGeofenceData.ts                        # Geofence data management
│   └── useNotifications.ts                       # Notification management
├── constants/
│   └── dashboard.ts                               # Constants and enums
├── utils/
│   └── dashboard.ts                               # Utility functions
└── lib/
    ├── types/                                     # Type definitions (existing)
    └── api/                                       # API functions (existing)
*/

// components/Dashboard/ClientManagementDashboard.tsx
// components/Dashboard/ClientManagementDashboard.tsx
import React, { useState, useMemo } from "react";
import { Tabs, Space, Input, Select, Flex, FloatButton, Spin } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  QrcodeOutlined,
  RadarChartOutlined,
} from "@ant-design/icons";

import { useAuth } from "@/components/providers/AuthProvider";
import { useNotifications } from "@/hooks/useNotifications";
import { useClientData } from "@/hooks/useClientData";
import { useQRCodeData } from "@/hooks/useQRCodeData";
import { useGeofenceData } from "@/hooks/useGeofenceData";

import { ClientManagementTab } from "@/components/ui/ClientManagement/tabs/ClientManagementTab";
import { QRCodeManagementTab } from "@/components/ui/ClientManagement/tabs/QRCodeManagementTab";
import { GeofenceManagementTab } from "@/components/ui/ClientManagement/tabs/GeofenceManagementTab";

import { TABS } from "@/lib/constants/clientDashboard";
import {
  filterClients,
  filterQRCodes,
  filterGeofences,
} from "@/lib/utils/clientDashboard";

const { Option } = Select;

export const ClientManagementPage = () => {
  const { token } = useAuth();
  const { showNotification, contextHolder } = useNotifications();

  // Data hooks
  const clientData = useClientData(token);
  const qrCodeData = useQRCodeData(token);
  const geofenceData = useGeofenceData(token);

  // UI state - Fix 1: Change activeTab type to string
  const [activeTab, setActiveTab] = useState<string>(TABS.CLIENTS);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filtered data
  const filteredClients = useMemo(
    () => filterClients(clientData.clients, searchText, statusFilter),
    [clientData.clients, searchText, statusFilter]
  );

  // Fix 2: Properly type the filteredQRCodes by ensuring client property matches expected type
  const filteredQRCodes = useMemo(() => {
    const filtered = filterQRCodes(
      qrCodeData.qrCodes,
      clientData.clients,
      searchText
    );
    // Ensure the client property has the correct type
    return filtered.map((qr) => ({
      ...qr,
      client: qr.client
        ? {
            id: qr.client.id,
            business_name: qr.client.business_name,
            email: qr.client.email,
            contact_person: qr.client.contact_person || undefined, // Convert null to undefined
            location_address: qr.client.location_address || undefined,
            status: qr.client.status || undefined,
          }
        : undefined,
    }));
  }, [qrCodeData.qrCodes, clientData.clients, searchText]);

  const filteredGeofences = useMemo(
    () =>
      filterGeofences(geofenceData.geofences, clientData.clients, searchText),
    [geofenceData.geofences, clientData.clients, searchText]
  );

  // Loading state
  const isLoading =
    clientData.loading || qrCodeData.loading || geofenceData.loading;

  if (
    isLoading &&
    activeTab === TABS.CLIENTS &&
    clientData.clients.length === 0
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {contextHolder}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <Flex justify="space-between" align="center">
          <div>
            <p className="text-gray-600">
              Manage clients, QR codes, and geofencing settings
            </p>
          </div>
          <Space>
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              placeholder="Status"
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="on_hold">On Hold</Option>
            </Select>
          </Space>
        </Flex>
      </div>

      {/* Main Content - Fix 3: Add teal-700 styling for active tabs */}
      <div className="py-6">
        <Tabs
          activeKey={activeTab}
          onChange={(activeKey) => setActiveTab(activeKey)}
          className="custom-tabs-teal"
          tabBarStyle={{
            borderBottom: ` ${
              activeTab === TABS.CLIENTS ? " border border-teal-700" : ""
            }`,
          }}
          items={[
            {
              key: TABS.CLIENTS,
              label: (
                <span
                  className={`flex gap-1 items-center ${
                    activeTab === TABS.CLIENTS ? "text-teal-700" : ""
                  }`}
                >
                  <UserOutlined
                    className={
                      activeTab === TABS.CLIENTS ? "text-teal-700" : ""
                    }
                  />
                  Clients ({clientData.clients.length})
                </span>
              ),
              children: (
                <ClientManagementTab
                  clients={filteredClients}
                  clientData={clientData}
                  showNotification={showNotification}
                />
              ),
            },
            {
              key: TABS.QRCODES,
              label: (
                <span
                  className={`flex gap-1 items-center ${
                    activeTab === TABS.QRCODES ? "text-teal-700" : ""
                  }`}
                >
                  <QrcodeOutlined  className={ 
                      activeTab === TABS.QRCODES ? "text-teal-700" : ""
                    }/>
                  QR Codes ({qrCodeData.qrCodes.length})
                </span>
              ),
              children: (
                <QRCodeManagementTab
                  qrCodes={filteredQRCodes}
                  qrCodeData={qrCodeData}
                  clients={clientData.clients}
                  showNotification={showNotification}
                />
              ),
            },
            {
              key: TABS.GEOFENCES,
              label: (
                <span
                  className={`flex gap-1 items-center ${
                    activeTab === TABS.GEOFENCES ? "text-teal-700" : ""
                  }`}
                >
                  <RadarChartOutlined  className={ 
                      activeTab === TABS.GEOFENCES ? "text-teal-700" : ""
                    } />
                  Geofences ({geofenceData.geofences.length})
                </span>
              ),
              children: (
                <GeofenceManagementTab
                  geofences={filteredGeofences}
                  geofenceData={geofenceData}
                  clients={clientData.clients}
                  showNotification={showNotification}
                />
              ),
            },
          ]}
        />
      </div>

      <FloatButton.BackTop />
    </div>
  );
};

export default ClientManagementPage;
