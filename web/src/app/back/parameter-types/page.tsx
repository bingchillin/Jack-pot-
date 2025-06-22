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
import { Space, Table, Drawer, Input, Typography, Tooltip } from "antd";
import { PlusCircleOutlined, SearchOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ParameterTypeDetails } from "@components/parameter-type/show";
import { CreateParameterTypeModal } from "@components/parameter-type/create";
import { getHoverableProps } from "@styles/common";

const { Text } = Typography;

export default function ParameterTypeList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedParameterType, setSelectedParameterType] = useState<BaseRecord | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [searchParameterType, setSearchParameterType] = useState("");

  // Get all data without any server-side filtering
  const { tableProps: originalTableProps, tableQueryResult } = useTable({
    syncWithLocation: false, // Disable sync since we're doing client-side filtering
  });

  // Client-side filtering of the data
  const filteredData = useMemo(() => {
    if (!originalTableProps?.dataSource) return [];

    if (!searchParameterType.trim()) {
      return originalTableProps.dataSource;
    }

    return originalTableProps.dataSource.filter((parameterType: any) =>
      parameterType.title?.toLowerCase().includes(searchParameterType.toLowerCase())
    );
  }, [originalTableProps?.dataSource, searchParameterType]);

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
          <span style={{ color: '#000000' }}>{filteredData.length}</span> {filteredData.length === 1 ? 'objectprofile' : 'objectprofiles'} in total
        </Text>
      </div>
    ),
  };

  // Handle URL-based drawer opening
  useEffect(() => {
    const showId = searchParams.get('show');
    if (showId) {
      const parameterType = filteredData.find(p => p.idParameterType === parseInt(showId));
      if (parameterType) {
        setSelectedParameterType(parameterType);
        setDrawerVisible(true);
      }
    } else {
      setDrawerVisible(false);
      setSelectedParameterType(null);
    }
  }, [searchParams, filteredData]);

  const handleShow = (record: BaseRecord) => {
    setSelectedParameterType(record);
    setDrawerVisible(true);
    // Update URL with show parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('show', record.idObjectProfile.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClose = () => {
    setDrawerVisible(false);
    setSelectedParameterType(null);
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
          Add new parameter type
        </CreateButton>
        <Input
          placeholder="Search by parameter type"
          prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />}
          value={searchParameterType}
          onChange={(e) => setSearchParameterType(e.target.value)}
          style={{ width: 300 }}
          size="large"
          allowClear
        />
      </div>

      <List
        title={false}
        canCreate={false}
      >
        <Table {...tableProps} rowKey="idParameterType">
          <Table.Column dataIndex="idParameterType" title={"ID"} />
          <Table.Column dataIndex="title" title={"Title"} />
          <Table.Column
            title="Parameter Type"
            render={(_, record) => (
              <Tooltip title={`Parameter Type ID: ${record.parameterType?.idParameterType || 'N/A'}`}>
                <span {...getHoverableProps()}>{record.parameterType?.title || '-'}</span>
              </Tooltip>
            )}
          />
          <Table.Column dataIndex="advise" title={"Advice"} />
          <Table.Column
            title={"Actions"}
            dataIndex="actions"
            render={(_, record: BaseRecord) => (
              <Space>
                <EditButton hideText size="small" recordItemId={record.idParameterType} />
                <ShowButton hideText size="small" onClick={() => handleShow(record)} />
                <DeleteButton hideText size="small" recordItemId={record.idParameterType} />
              </Space>
            )}
          />
        </Table>
      </List>

      <Drawer
        title={`${selectedParameterType?.title} details`}
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
        {selectedParameterType && <ParameterTypeDetails record={selectedParameterType} />}
      </Drawer>

      <CreateParameterTypeModal
        visible={createModalVisible}
        onCancel={handleCreateCancel}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}