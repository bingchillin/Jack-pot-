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
import { CheckCircleOutlined, CloseCircleOutlined, PlusCircleOutlined, SearchOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ObjectDetails } from "@components/object/show";
import { CreateObjectModal } from "@components/object/create";
import { getHoverableProps } from "@styles/common";

const { Text } = Typography;

export default function ObjectList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedObject, setSelectedObject] = useState<BaseRecord | null>(null);
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

    return originalTableProps.dataSource.filter((object: any) =>
      object.title?.toLowerCase().includes(searchTitle.toLowerCase())
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
          <span style={{ color: '#000000' }}>{filteredData.length}</span> {filteredData.length === 1 ? 'object' : 'objects'} in total
        </Text>
      </div>
    ),
  };

  // Handle URL-based drawer opening
  useEffect(() => {
    const showId = searchParams.get('show');
    if (showId) {
      const object = filteredData.find(p => p.idObject === parseInt(showId));
      if (object) {
        setSelectedObject(object);
        setDrawerVisible(true);
      }
    } else {
      setDrawerVisible(false);
      setSelectedObject(null);
    }
  }, [searchParams, filteredData]);

  const handleShow = (record: BaseRecord) => {
    setSelectedObject(record);
    setDrawerVisible(true);
    // Update URL with show parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('show', record.idObject.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClose = () => {
    setDrawerVisible(false);
    setSelectedObject(null);
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
          Add new object
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
        <Table {...tableProps} rowKey="idObject">
          <Table.Column dataIndex="idObject" title="ID" />
          <Table.Column dataIndex="title" title="Title" />
          <Table.Column
            title="Category Type"
            render={(_, record) => (
              <Tooltip title={`Category Type ID: ${record.categoryType?.idCategoryType || 'N/A'}`}>
                <span {...getHoverableProps()}>{record.categoryType?.title || '-'}</span>
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
          <Table.Column
            dataIndex="is_reset"
            title="Reset ?"
            render={(value) => (
              <Tag color={value ? "success" : "error"} icon={value ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                {value ? "Yes" : "No"}
              </Tag>
            )}
          />
          <Table.Column
            dataIndex="preference_number"
            title="Preference Number"
            render={(value) => (
              <Tag color={value ? "success" : "default"}>
                {value ?? "Not specified"}
              </Tag>
            )}
          />
          <Table.Column
            title={"Actions"}
            dataIndex="actions"
            render={(_, record: BaseRecord) => (
              <Space>
                <EditButton hideText size="small" recordItemId={record.idObject} />
                <ShowButton hideText size="small" onClick={() => handleShow(record)} />
                <DeleteButton hideText size="small" recordItemId={record.idObject} />
              </Space>
            )}
          />
        </Table>
      </List>

      <Drawer
        title={`${selectedObject?.title} details`}
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
        {selectedObject && <ObjectDetails record={selectedObject} />}
      </Drawer>

      <CreateObjectModal
        visible={createModalVisible}
        onCancel={handleCreateCancel}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}