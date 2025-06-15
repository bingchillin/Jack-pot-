"use client";

import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  CreateButton,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag, Drawer, Input, Button, Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, PlusCircleOutlined, SearchOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ContactDetails } from "@components/contact/show";
import { CreateContactModal } from "@components/contact/create";

const { Text } = Typography;

export default function ContactList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedContact, setSelectedContact] = useState<BaseRecord | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");

  // Get all data without any server-side filtering
  const { tableProps: originalTableProps, tableQueryResult } = useTable({
    resource: "contacts",
    syncWithLocation: false, // Disable sync since we're doing client-side filtering
  });

  // Client-side filtering of the data
  const filteredData = useMemo(() => {
    if (!originalTableProps?.dataSource) return [];
    
    if (!searchEmail.trim()) {
      return originalTableProps.dataSource;
    }

    return originalTableProps.dataSource.filter((contact: any) => 
      contact.email?.toLowerCase().includes(searchEmail.toLowerCase())
    );
  }, [originalTableProps?.dataSource, searchEmail]);

  // Create modified tableProps with filtered data
  const tableProps = {
    ...originalTableProps,
    dataSource: filteredData,
    pagination: {
      ...originalTableProps?.pagination,
      total: filteredData.length,
      current: 1, // Reset to first page when filtering
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
      const contact = filteredData.find(c => c.idContact === parseInt(showId));
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
    setSelectedContact(record);
    setDrawerVisible(true);
    // Update URL with show parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('show', record.idContact.toString());
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

  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  const handleCreateCancel = () => {
    setCreateModalVisible(false);
  };

  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    // Refresh the table using tableQueryResult
    tableQueryResult.refetch();
  };

  return (
    <>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <CreateButton
          icon={<PlusCircleOutlined />}
          size="large"
          style={{
            height: "40px",
            fontWeight: 500,
          }}
          onClick={handleCreate}
        >
          Add new contact
        </CreateButton>
        <Input
          placeholder="Search by email"
          prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />}
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          style={{ width: 300 }}
          size="large"
          allowClear
        />
      </div>

      <List
        title={false}
        canCreate={false}
      >
        <Table {...tableProps} rowKey="idContact">
          <Table.Column dataIndex="idContact" title={"ID"} />
          <Table.Column dataIndex="firstname" title={"Firstname"} />
          <Table.Column dataIndex="surname" title={"Surname"} />
          <Table.Column 
            dataIndex={"email"} 
            title={"Email"}
            render={(email) => (
              <Space>
                <MailOutlined />
                <Text>{email}</Text>
              </Space>
            )}
          />
          <Table.Column 
            dataIndex={"phone"} 
            title={"Phone"}
            render={(phone) => (
              <Space>
                <PhoneOutlined />
                <Text>{phone || '-'}</Text>
              </Space>
            )}
          />
          <Table.Column
            title={"Actions"}
            dataIndex="actions"
            render={(_, record: BaseRecord) => (
              <Space>
                <EditButton hideText size="small" recordItemId={record.idContact} />
                <ShowButton hideText size="small" onClick={() => handleShow(record)} />
                <DeleteButton hideText size="small" recordItemId={record.idContact} />
              </Space>
            )}
          />
        </Table>
      </List>

      <Drawer
        title={`${selectedContact?.firstname} ${selectedContact?.surname} details`}
        placement="right"
        onClose={handleClose}
        open={drawerVisible}
        width={600}
        styles={{
          body: {
            background: '#f5f5f5',
          },
        }}
      >
        {selectedContact && <ContactDetails record={selectedContact} />}
      </Drawer>

      <CreateContactModal
        visible={createModalVisible}
        onCancel={handleCreateCancel}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}