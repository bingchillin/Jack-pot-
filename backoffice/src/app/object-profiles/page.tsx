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
import { ObjectProfileDetails } from "@components/objectprofile/show";
import { CreateObjectprofileModal } from "@components/objectprofile/create";
import { getHoverableProps } from "@styles/common";

const { Text } = Typography;

export default function ObjectProfileList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedObjectprofile, setSelectedObjectprofile] = useState<BaseRecord | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [searchObject, setSearchObject] = useState("");

  // Get all data without any server-side filtering
  const { tableProps: originalTableProps, tableQueryResult } = useTable({
    syncWithLocation: false, // Disable sync since we're doing client-side filtering
  });

  // Client-side filtering of the data
  const filteredData = useMemo(() => {
    if (!originalTableProps?.dataSource) return [];
    
    if (!searchObject.trim()) {
      return originalTableProps.dataSource;
    }

    return originalTableProps.dataSource.filter((objectprofile: any) => 
      objectprofile.object?.title?.toLowerCase().includes(searchObject.toLowerCase())
    );
  }, [originalTableProps?.dataSource, searchObject]);

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
      const objectprofile = filteredData.find(p => p.idObjectprofile === parseInt(showId));
      if (objectprofile) {
        setSelectedObjectprofile(objectprofile);
        setDrawerVisible(true);
      }
    } else {
      setDrawerVisible(false);
      setSelectedObjectprofile(null);
    }
  }, [searchParams, filteredData]);

  const handleShow = (record: BaseRecord) => {
    setSelectedObjectprofile(record);
    setDrawerVisible(true);
    // Update URL with show parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('show', record.idObjectProfile.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClose = () => {
    setDrawerVisible(false);
    setSelectedObjectprofile(null);
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
          Add new object profile
        </CreateButton>
        <Input
          placeholder="Search by object"
          prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />}
          value={searchObject}
          onChange={(e) => setSearchObject(e.target.value)}
          style={{ width: 300 }}
          size="large"
          allowClear
        />
      </div>

      <List
        title={false}
        canCreate={false}
      >
        <Table {...tableProps} rowKey="idObjectProfile">
          <Table.Column dataIndex="idObjectProfile" title={"ID"} />
          <Table.Column dataIndex="title" title={"Title"} />
          <Table.Column
            title="Object"
            render={(_, record) => (
              <Tooltip title={`Object ID: ${record.object?.idObject || 'N/A'}`}>
                <span {...getHoverableProps()}>{record.object?.title || '-'}</span>
              </Tooltip>
            )}
          />
          <Table.Column
            title="Plant Type"
            render={(_, record) => (
              <Tooltip title={`Plant Type ID: ${record.plantType?.idPlantType || 'N/A'}`}>
                <span {...getHoverableProps()}>{record.plantType?.title || '-'}</span>
              </Tooltip>
            )}
          />
          <Table.Column dataIndex="advise" title={"Advice"} />
          <Table.Column
            title={"Actions"}
            dataIndex="actions"
            render={(_, record: BaseRecord) => (
              <Space>
                <EditButton hideText size="small" recordItemId={record.idObjectProfile} />
                <ShowButton hideText size="small" onClick={() => handleShow(record)} />
                <DeleteButton hideText size="small" recordItemId={record.idObjectProfile} />
              </Space>
            )}
          />
        </Table>
      </List>

      <Drawer
        title={`${selectedObjectprofile?.firstname} ${selectedObjectprofile?.surname} details`}
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
        {selectedObjectprofile && <ObjectProfileDetails record={selectedObjectprofile} />}
      </Drawer>

      <CreateObjectprofileModal
        visible={createModalVisible}
        onCancel={handleCreateCancel}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}