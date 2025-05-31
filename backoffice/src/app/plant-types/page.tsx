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
import { 
  EnvironmentOutlined, 
  FieldTimeOutlined, 
  SearchOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PlantTypeDetails } from "@components/plant-type/show";
import { seasonColors } from "@/utils/api/enum";

const { Text } = Typography;

export default function PlantTypeList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedPlantType, setSelectedPlantType] = useState<BaseRecord | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
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
    router.push('/plant-types/create');
  };

  const getSeasonTag = (season: string) => {
    const color = seasonColors[season as keyof typeof seasonColors] || 'default';
    return <Tag color={color}>{season}</Tag>;
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
          <Table.Column 
            dataIndex="title" 
            title={"Name"}
          />
          <Table.Column 
            dataIndex="family_name" 
            title={"Family"} 
            render={(text) => (
              <Text type="secondary" italic>{text}</Text>
            )}
          />
          <Table.Column 
            dataIndex="type_name" 
            title={"Type"}
          />
          <Table.Column 
            dataIndex="plantation_saison" 
            title={"Growing Conditions"} 
            render={(_, record: any) => (
              <Space direction="horizontal" size="small">
                {record.exposition_type && (
                  <Tag color="blue" icon={<EnvironmentOutlined />}>
                    {record.exposition_type}
                  </Tag>
                )}
                {record.ground_type && (
                  <Tag color="green" icon={<EnvironmentOutlined />}>
                    {record.ground_type}
                  </Tag>
                )}
                {record.plantation_saison && (
                  <Tag color="orange" icon={<FieldTimeOutlined />}>
                    {record.plantation_saison}
                  </Tag>
                )}
              </Space>
            )}
          />
          <Table.Column 
            dataIndex="saison_first" 
            title={"Growing Seasons"} 
            render={(_, record: any) => (
              <Space wrap>
                {record.saison_first && getSeasonTag(record.saison_first)}
                {record.saison_second && getSeasonTag(record.saison_second)}
                {record.saison_third && getSeasonTag(record.saison_third)}
              </Space>
            )}
          />
          <Table.Column
            title={"Actions"}
            dataIndex="actions"
            render={(_, record: BaseRecord) => (
              <Space>
                <EditButton hideText size="small" recordItemId={record.idPlantType} />
                <ShowButton hideText size="small" onClick={() => handleShow(record)} />
                <DeleteButton hideText size="small" recordItemId={record.idPlantType} />
              </Space>
            )}
          />
        </Table>
      </List>

      <Drawer
        title={`${selectedPlantType?.title} details`}
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
        {selectedPlantType && <PlantTypeDetails record={selectedPlantType} />}
      </Drawer>
    </>
  );
}