"use client";

import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  CreateButton,
} from "@refinedev/antd";
import { type BaseRecord, useApiUrl } from "@refinedev/core";
import { Space, Table, Tag, Drawer, Input, Button, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, CrownOutlined, PlusCircleOutlined, UserOutlined, SearchOutlined, MailOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PersonDetails } from "@components/person/show";
import { CreatePersonModal } from "@components/person/create";

export default function PersonList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedPerson, setSelectedPerson] = useState<BaseRecord | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const apiUrl = useApiUrl();

  // Get all data without any server-side filtering
  const { tableProps: originalTableProps, tableQueryResult } = useTable({
    syncWithLocation: false, // Disable sync since we're doing client-side filtering
  });

  // Client-side filtering of the data
  const filteredData = useMemo(() => {
    if (!originalTableProps?.dataSource) return [];
    
    if (!searchEmail.trim()) {
      return originalTableProps.dataSource;
    }

    return originalTableProps.dataSource.filter((person: any) => 
      person.email?.toLowerCase().includes(searchEmail.toLowerCase())
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
  };

  // Handle URL-based drawer opening
  useEffect(() => {
    const showId = searchParams.get('show');
    if (showId) {
      const person = filteredData.find(p => p.idPerson === parseInt(showId));
      if (person) {
        setSelectedPerson(person);
        setDrawerVisible(true);
      }
    } else {
      setDrawerVisible(false);
      setSelectedPerson(null);
    }
  }, [searchParams, filteredData]);

  const getRoleIcon = (roleTitle: string) => {
    switch (roleTitle?.toLowerCase()) {
      case 'admin':
        return <CrownOutlined style={{ color: '#faad14' }} />;
      default:
        return <UserOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const handleShow = (record: BaseRecord) => {
    setSelectedPerson(record);
    setDrawerVisible(true);
    // Update URL with show parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('show', record.idPerson.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClose = () => {
    setDrawerVisible(false);
    setSelectedPerson(null);
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

  const handleResendVerification = async (email: string) => {
    try {
      const response = await fetch(`${apiUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to resend verification email');
      }

      messageApi.success('Verification email sent successfully');
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : 'Failed to send verification email');
    }
  };

  return (
    <>
      {contextHolder}
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
          Add new person
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
        <Table {...tableProps} rowKey="idPerson">
          <Table.Column dataIndex="idPerson" title={"ID"} />
          <Table.Column dataIndex="firstname" title={"Firstname"} />
          <Table.Column dataIndex="surname" title={"Surname"} />
          <Table.Column dataIndex={"email"} title={"Email"} />
          <Table.Column
            dataIndex="isEmailVerified"
            title={"Is Email Verified"}
            render={(value, record: any) => (
              <Space>
                <Tag color={value ? "success" : "error"} icon={value ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                  {value ? "Yes" : "No"}
                </Tag>
                {!value && (
                  <Button
                    type="link"
                    icon={<MailOutlined />}
                    onClick={() => handleResendVerification(record.email)}
                    size="small"
                  >
                    Resend
                  </Button>
                )}
              </Space>
            )}
          />
          <Table.Column
            dataIndex="role"
            title={"Role"}
            render={(value) => (
              <Space>
                {getRoleIcon(value?.title)}
                <Tag color={value?.title?.toLowerCase() === 'admin' ? 'gold' : 'blue'}>
                  {value?.title || '-'}
                </Tag>
              </Space>
            )}
          />
          <Table.Column
            title={"Actions"}
            dataIndex="actions"
            render={(_, record: BaseRecord) => (
              <Space>
                <EditButton hideText size="small" recordItemId={record.idPerson} />
                <ShowButton hideText size="small" onClick={() => handleShow(record)} />
                <DeleteButton hideText size="small" recordItemId={record.idPerson} />
              </Space>
            )}
          />
        </Table>
      </List>

      <Drawer
        placement="right"
        onClose={handleClose}
        open={drawerVisible}
        width={600}
        styles={{
          body: {
            background: '#f5f5f5',
            paddingTop: '48px',
          },
        }}
      >
        {selectedPerson && <PersonDetails record={selectedPerson} />}
      </Drawer>

      <CreatePersonModal
        visible={createModalVisible}
        onCancel={handleCreateCancel}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}