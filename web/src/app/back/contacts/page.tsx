"use client";

import {
  DeleteButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag, Drawer, Input, Typography, Tooltip, Button } from "antd";
import { UserOutlined, DownloadOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ContactDetails } from "@/components/contact/show";
import { getHoverableProps } from "@styles/common";
import { getIcon } from "@/utils/icon-mapping";

const { Text } = Typography;

// Define contact type for better type safety
interface Contact extends BaseRecord {
  id: number;
  requester?: {
    id: number;
    email: string;
    firstname: string;
    surname: string;
  };
  receiver?: {
    id: number;
    email: string;
    firstname: string;
    surname: string;
  };
  status: string;
  blockedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Function to convert contacts to CSV
const convertToCSV = (contacts: Contact[]) => {
  // Define CSV headers
  const headers = [
    'ID',
    'Requester ID',
    'Requester Email',
    'Requester Name',
    'Receiver ID',
    'Receiver Email',
    'Receiver Name',
    'Status',
    'Blocked By',
    'Created At',
    'Updated At'
  ].join(',');

  // Convert each contact to a CSV row
  const rows = contacts.map(contact => [
    contact.id,
    contact.requester?.id || '',
    contact.requester?.email || '',
    `${contact.requester?.firstname || ''} ${contact.requester?.surname || ''}`.trim(),
    contact.receiver?.id || '',
    contact.receiver?.email || '',
    `${contact.receiver?.firstname || ''} ${contact.receiver?.surname || ''}`.trim(),
    contact.status,
    contact.blockedBy || '',
    new Date(contact.createdAt).toISOString(),
    new Date(contact.updatedAt).toISOString()
  ].map(field => {
    // Escape fields that might contain commas or quotes
    const stringField = String(field);
    if (stringField.includes(',') || stringField.includes('"')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  }).join(','));

  // Combine headers and rows
  return [headers, ...rows].join('\n');
};

// Function to trigger CSV download
const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ContactList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedContact, setSelectedContact] = useState<BaseRecord | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get all data without any server-side filtering
  const { tableProps: originalTableProps, tableQueryResult } = useTable({
    syncWithLocation: false, // Disable sync since we're doing client-side filtering
  });

  // Client-side filtering of the data
  const filteredData = useMemo(() => {
    if (!originalTableProps?.dataSource) return [];
    
    if (!searchQuery.trim()) {
      return originalTableProps.dataSource as Contact[];
    }

    const query = searchQuery.toLowerCase();
    return (originalTableProps.dataSource as Contact[]).filter((contact) => 
      contact.requester?.email?.toLowerCase().includes(query) ||
      contact.receiver?.email?.toLowerCase().includes(query) ||
      contact.requester?.firstname?.toLowerCase().includes(query) ||
      contact.receiver?.firstname?.toLowerCase().includes(query) ||
      contact.requester?.surname?.toLowerCase().includes(query) ||
      contact.receiver?.surname?.toLowerCase().includes(query)
    );
  }, [originalTableProps?.dataSource, searchQuery]);

  // Handle export
  const handleExport = () => {
    const csv = convertToCSV(filteredData);
    const filename = `contacts_export_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  // Create modified tableProps with filtered data
  const tableProps = {
    ...originalTableProps,
    dataSource: filteredData,
    pagination: {
      ...originalTableProps?.pagination,
      total: filteredData.length,
      // Remove the current: 1 line to allow proper pagination
    },
    footer: () => (
      <div style={{ textAlign: 'right', padding: '8px 0' }}>
        <Text type="secondary">
          <span style={{ color: '#000000' }}>{filteredData.length}</span> {filteredData.length === 1 ? 'contact' : 'contacts'} in total
        </Text>
      </div>
    ),
  };

  // Handle URL-based drawer opening
  useEffect(() => {
    const showId = searchParams.get('show');
    if (showId) {
      const contact = filteredData.find(c => c.id === parseInt(showId));
      if (contact) {
        setSelectedContact(contact);
        setDrawerVisible(true);
      }
    } else {
      setDrawerVisible(false);
      setSelectedContact(null);
    }
  }, [searchParams, filteredData]);

  const handleShow = (record: BaseRecord) => {
    if (!record.id) return;
    setSelectedContact(record);
    setDrawerVisible(true);
    // Update URL with show parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('show', record.id.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClose = () => {
    setDrawerVisible(false);
    setSelectedContact(null);
    // Remove show parameter from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete('show');
    router.push(`${pathname}?${params.toString()}`);
  };

  const getStatusTag = (status: string) => {
    const statusColors = {
      pending: 'warning',
      accepted: 'success',
      rejected: 'error',
      blocked: 'error'
    };
    return (
      <Tag color={statusColors[status as keyof typeof statusColors] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    );
  };

  return (
    <>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input
            placeholder="Search by name or email"
            prefix={getIcon("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
            size="large"
            allowClear
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            size="large"
          >
            Export Contacts
          </Button>
        </Space>
      </div>

      <List
        title={false}
        canCreate={false}
      >
        <Table {...tableProps} rowKey="id">
          <Table.Column dataIndex="id" title="ID" width={60} />
          <Table.Column
            title="Requester Email"
            width={200}
            render={(_, record) => (
              <Tooltip title={`ID: ${record.requester?.id || 'N/A'}`}>
                <span {...getHoverableProps()}>{record.requester?.email || '-'}</span>
              </Tooltip>
            )}
          />
          <Table.Column
            title="Receiver Email"
            width={200}
            render={(_, record) => (
              <Tooltip title={`ID: ${record.receiver?.id || 'N/A'}`}>
                <span {...getHoverableProps()}>{record.receiver?.email || '-'}</span>
              </Tooltip>
            )}
          />
          <Table.Column
            title="Status"
            width={100}
            render={(_, record) => getStatusTag(record.status)}
          />
          <Table.Column
            title="Actions"
            dataIndex="actions"
            width={100}
            fixed="right"
            render={(_, record: BaseRecord) => (
              <Space>
                <ShowButton hideText size="small" onClick={() => handleShow(record)} />
                <DeleteButton hideText size="small" recordItemId={record.id} />
              </Space>
            )}
          />
        </Table>
      </List>

      <Drawer
        title="Contact Details"
        placement="right"
        onClose={() => {
          setDrawerVisible(false);
          setSelectedContact(null);
          // Remove the contact_id from the URL
          const params = new URLSearchParams(searchParams);
          params.delete("contact_id");
          router.push(`${pathname}?${params.toString()}`);
        }}
        open={drawerVisible}
        width={600}
      >
        {selectedContact && (
          <ContactDetails
            record={selectedContact}
            onStatusChange={() => {
              tableQueryResult.refetch();
            }}
          />
        )}
      </Drawer>
    </>
  );
}