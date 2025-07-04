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
import { Space, Table, Drawer, Input, Typography, Tooltip, Tag } from "antd";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ObjectProfileDetails } from "@components/objectprofile/show";
import { getHoverableProps } from "@styles/common";
import { getIcon } from "@/utils/icon-mapping";

const { Text } = Typography;

export default function ObjectProfileList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedObjectprofile, setSelectedObjectprofile] = useState<BaseRecord | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
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
      objectprofile.title?.toLowerCase().includes(searchObject.toLowerCase())
    );
  }, [originalTableProps?.dataSource, searchObject]);

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
          <span style={{ color: '#000000' }}>{filteredData.length}</span> {filteredData.length === 1 ? 'Object Profile' : 'Object Profiles'} in total
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

  return (
    <>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <CreateButton
          icon={getIcon("add")}
          size="large"
          style={{
            height: "40px",
            fontWeight: 500,
          }}
        >
          Add new object profile
        </CreateButton>
        <Input
          placeholder="Search by title"
          prefix={getIcon("search")}
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
          <Table.Column 
            dataIndex="idObjectProfile" 
            title="ID" 
            width={60}
          />
          <Table.Column 
            dataIndex="title" 
            title="Title"
            width={200}
          />
          <Table.Column
            title="Object"
            width={150}
            render={(_, record) => record.object?.title || '-'}
          />
          <Table.Column
            title="Plant Type"
            width={150}
            render={(_, record) => record.plantType?.title || '-'}
          />
          <Table.Column
            title="Person"
            width={200}
            render={(_, record) => (
              <Tooltip title={`Person ID: ${record.person?.idPerson || 'N/A'}`}>
                <span {...getHoverableProps()}>{record.person?.email || '-'}</span>
              </Tooltip>
            )}
          />
          <Table.Column
            title="Status"
            width={100}
            render={(_, record) => (
              <Tag color={
                record.state === 0 ? 'default' :
                record.state === 1 ? 'success' :
                record.state === 2 ? 'warning' : 'error'
              }>
                {record.state === 0 ? 'Default' :
                 record.state === 1 ? 'Active' :
                 record.state === 2 ? 'Warning' : 'Error'}
              </Tag>
            )}
          />
          <Table.Column
            title="Actions"
            dataIndex="actions"
            width={100}
            fixed="right"
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
        title={`${selectedObjectprofile?.title} details`}
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
    </>
  );
}