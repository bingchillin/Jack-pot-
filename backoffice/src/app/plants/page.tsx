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
import { Space, Table, Tag, Drawer, Input, Typography, Tooltip } from "antd";
import { CrownOutlined, PlusCircleOutlined, UserOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PlantDetails } from "@components/plant/show";
import { CreatePlantModal } from "@components/plant/create";
import { getHoverableProps } from "@styles/common";

const { Text } = Typography;

export default function PlantList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedPlant, setSelectedPlant] = useState<BaseRecord | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [searchName, setSearchName] = useState("");

  // Get all data without any server-side filtering
  const { tableProps: originalTableProps, tableQueryResult } = useTable({
    syncWithLocation: false, // Disable sync since we're doing client-side filtering
  });

  // Client-side filtering of the data
  const filteredData = useMemo(() => {
    if (!originalTableProps?.dataSource) return [];
    
    if (!searchName.trim()) {
      return originalTableProps.dataSource;
    }

    return originalTableProps.dataSource.filter((plant: any) => 
      plant.name?.toLowerCase().includes(searchName.toLowerCase())
    );
  }, [originalTableProps?.dataSource, searchName]);

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
          <span style={{ color: '#000000' }}>{filteredData.length}</span> {filteredData.length === 1 ? 'plant' : 'plants'} in total
        </Text>
      </div>
    ),
  };

  // Handle URL-based drawer opening
  useEffect(() => {
    const showId = searchParams.get('show');
    if (showId) {
      const plant = filteredData.find(p => p.idPlant === parseInt(showId));
      if (plant) {
        setSelectedPlant(plant);
        setDrawerVisible(true);
      }
    } else {
      setDrawerVisible(false);
      setSelectedPlant(null);
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
    setSelectedPlant(record);
    setDrawerVisible(true);
    // Update URL with show parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('show', record.idPlant.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClose = () => {
    setDrawerVisible(false);
    setSelectedPlant(null);
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
          Add new plant
        </CreateButton>
        <Input
          placeholder="Search by name"
          prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />}
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{ width: 300 }}
          size="large"
          allowClear
        />
      </div>

      <List
        title={false}
        canCreate={false}
      >
        <Table {...tableProps} rowKey="idPlant">
          <Table.Column dataIndex="idPlant" title={"ID"} />
          <Table.Column
            title="Object"
            render={(_, record) => (
              <Tooltip title={`Object ID: ${record.object?.idObject || 'N/A'}`}>
                <span {...getHoverableProps()}>{record.object?.title || '-'}</span>
              </Tooltip>
            )}
          />
          <Table.Column
            title="Person"
            render={(_, record) => (
              <Tooltip title={`Person ID: ${record.person?.idPerson || 'N/A'}`}>
                <span {...getHoverableProps()}>{record.person?.email || '-'}</span>
              </Tooltip>
            )}
          />
          <Table.Column dataIndex="name" title={"Name"} />
          <Table.Column dataIndex="category" title={"Category"} />
          <Table.Column dataIndex="price" title={"Price"} render={(value) => <span>{value} €</span>} />
          <Table.Column
            dataIndex="isAvailable"
            title="Is Available ?"
            render={(value) => (
              <Tag color={value ? "success" : "error"} icon={value ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                {value ? "Yes" : "No"}
              </Tag>
            )}
          />
          <Table.Column
            title={"Actions"}
            dataIndex="actions"
            render={(_, record: BaseRecord) => (
              <Space>
                <EditButton hideText size="small" recordItemId={record.idPlant} />
                <ShowButton hideText size="small" onClick={() => handleShow(record)} />
                <DeleteButton hideText size="small" recordItemId={record.idPlant} />
              </Space>
            )}
          />
        </Table>
      </List>

      <Drawer
        title={`${selectedPlant?.name} details`}
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
        {selectedPlant && <PlantDetails record={selectedPlant} />}
      </Drawer>

      <CreatePlantModal
        visible={createModalVisible}
        onCancel={handleCreateCancel}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}