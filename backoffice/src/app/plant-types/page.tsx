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
import { Space, Table, Tag, Drawer, Input, Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, CrownOutlined, PlusCircleOutlined, UserOutlined, SearchOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PersonDetails } from "@components/person/show";
import { CreatePersonModal } from "@components/person/create";
import { PlantTypeDetails } from "@components/plant-type/show";
import { CreatePlantTypeModal } from "@components/plant-type/create";

const { Text } = Typography;

export default function PlantTypeList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedPlantType, setSelectedPlantType] = useState<BaseRecord | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [searchTitle, setSearchTitle] = useState("");

  // Get all data without any server-side filtering
  const { tableProps: originalTableProps, tableQueryResult } = useTable({
    syncWithLocation: false, // Disable sync since we're doing client-side filtering
  });

  // Client-side filtering of the data
  const filteredData = useMemo(() => {
    if (!originalTableProps?.dataSource) return [];
    
    if (!searchTitle.trim()) {
      return originalTableProps.dataSource;
    }

    return originalTableProps.dataSource.filter((plantType: any) => 
      plantType.title?.toLowerCase().includes(searchTitle.toLowerCase())
    );
  }, [originalTableProps?.dataSource, searchTitle]);

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
          <span style={{ color: '#000000' }}>{filteredData.length}</span> {filteredData.length === 1 ? 'plant type' : 'plant types'} in total
        </Text>
      </div>
    ),
  };

  // Handle URL-based drawer opening
  useEffect(() => {
    const showId = searchParams.get('show');
    if (showId) {
      const plantType = filteredData.find(p => p.idPlantType === parseInt(showId));
      if (plantType) {
        setSelectedPlantType(plantType);
        setDrawerVisible(true);
      }
    } else {
      setDrawerVisible(false);
      setSelectedPlantType(null);
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
    setSelectedPlantType(record);
    setDrawerVisible(true);
    // Update URL with show parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('show', record.idPlantType.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClose = () => {
    setDrawerVisible(false);
    setSelectedPlantType(null);
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
          Add new plant type
        </CreateButton>
        <Input
          placeholder="Search by title"
          prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />}
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          style={{ width: 300 }}
          size="large"
          allowClear
        />
      </div>

      <List
        title={false}
        canCreate={false}
      >
        <Table {...tableProps} rowKey="idPlantType">
          <Table.Column dataIndex="idPlantType" title={"ID"} />
          <Table.Column dataIndex="title" title={"Title"} />
          <Table.Column dataIndex="scientist_name" title={"Scientist Name"} />
          <Table.Column dataIndex={"family_name"} title={"Family Name"} />
          <Table.Column
            dataIndex="type_name"
            title={"Type Name"}
            render={(value) => (
              <Tag color={value ? "success" : "error"} icon={value ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                {value ? "Yes" : "No"}
              </Tag>
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
        {selectedPlantType && <PlantTypeDetails record={selectedPlantType} />}
      </Drawer>

      <CreatePlantTypeModal
        visible={createModalVisible}
        onCancel={handleCreateCancel}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}