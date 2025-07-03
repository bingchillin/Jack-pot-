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
import { Space, Table, Tag, Drawer, Input, Typography, Tooltip, Image } from "antd";
import { CrownOutlined, PlusCircleOutlined, UserOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, DollarOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ProductDetails } from "@components/product/show";
import { CreateProductModal } from "@components/product/create";
import { getHoverableProps } from "@styles/common";

const { Text } = Typography;

export default function ProductList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState<BaseRecord | null>(null);
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

    return originalTableProps.dataSource.filter((product: any) => 
      product.name?.toLowerCase().includes(searchName.toLowerCase())
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
          <span style={{ color: '#000000' }}>{filteredData.length}</span> {filteredData.length === 1 ? 'product' : 'products'} in total
        </Text>
      </div>
    ),
  };

  // Handle URL-based drawer opening
  useEffect(() => {
    const showId = searchParams.get('show');
    if (showId) {
      const product = filteredData.find(p => p.idProduct === parseInt(showId));
      if (product) {
        setSelectedProduct(product);
        setDrawerVisible(true);
      }
    } else {
      setDrawerVisible(false);
      setSelectedProduct(null);
    }
  }, [searchParams, filteredData]);

  const handleShow = (record: BaseRecord) => {
    setSelectedProduct(record);
    setDrawerVisible(true);
    // Update URL with show parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('show', record.idProduct.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClose = () => {
    setDrawerVisible(false);
    setSelectedProduct(null);
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
          Add new product
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
        <Table {...tableProps} rowKey="idProduct">
          <Table.Column dataIndex="idProduct" title={"ID"} />
                    <Table.Column 
            dataIndex="imageUrl" 
            title={"Image"} 
            render={(value, record) => (
              <img
                width={50}
                height={50}
                src={value}
                alt={record.name}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
              />
            )}
          />
          <Table.Column dataIndex="name" title={"Name"} />
          <Table.Column 
            dataIndex="price" 
            title={"Price"} 
            render={(value) => (
              <Space>
                <Text strong>{typeof value === 'string' ? parseFloat(value).toFixed(2) : value?.toFixed(2)} €</Text>
              </Space>
            )} 
          />
          <Table.Column dataIndex="sku" title={"SKU"} render={(value) => value || '-'} />
          <Table.Column 
            dataIndex="stockQuantity" 
            title={"Stock"} 
            render={(value, record) => (
              <Space direction="vertical" size="small">
                <Text>Available: {value || 0}</Text>
                {record.reservedQuantity > 0 && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Reserved: {record.reservedQuantity}
                  </Text>
                )}
              </Space>
            )}
          />
          <Table.Column
            dataIndex="isActive"
            title="Status"
            render={(value) => (
              <Tag color={value ? "success" : "error"} icon={value ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
                {value ? "Active" : "Inactive"}
              </Tag>
            )}
          />
          <Table.Column
            title={"Actions"}
            dataIndex="actions"
            render={(_, record: BaseRecord) => (
              <Space>
                <EditButton hideText size="small" recordItemId={record.idProduct} />
                <ShowButton hideText size="small" onClick={() => handleShow(record)} />
                <DeleteButton hideText size="small" recordItemId={record.idProduct} />
              </Space>
            )}
          />
        </Table>
      </List>

      <Drawer
        title={`${selectedProduct?.name} details`}
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
        {selectedProduct && <ProductDetails record={selectedProduct} />}
      </Drawer>

      <CreateProductModal
        visible={createModalVisible}
        onCancel={handleCreateCancel}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
} 