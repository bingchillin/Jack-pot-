"use client";

import {
  DeleteButton,
  List,
  ShowButton,
  useTable,
  DateField
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag, Drawer, Input, Typography, Row, Col, Select, DatePicker, Card, Descriptions, Tooltip, Button, message, Popconfirm, Popover } from "antd";
import { 
  CheckCircleOutlined, 
  CrownOutlined, 
  UserOutlined, 
  SearchOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  TruckOutlined,
  DollarCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { orderService } from "@/services/order.service";
import { ShippingStatus, UpdateShippingStatusRequest } from "@/interfaces/order.interface";
import { ShippingModal } from "@/components/order/shipping-modal";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// OrderDetails component
function OrderDetails({ record }: { record: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'payment_processing': return 'processing';
      case 'paid': return 'success';
      case 'payment_failed': return 'error';
      case 'cancelled': return 'error';
      case 'refunded': return 'purple';
      default: return 'default';
    }
  };

  const getShippingStatusColor = (status: string) => {
    switch (status) {
      case 'in_preparation': return 'orange';
      case 'shipped': return 'blue';
      case 'delivered': return 'green';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockCircleOutlined />;
      case 'payment_processing': return <ClockCircleOutlined />;
      case 'paid': return <CheckCircleOutlined />;
      case 'payment_failed': return <ExclamationCircleOutlined />;
      case 'cancelled': return <ExclamationCircleOutlined />;
      case 'refunded': return <ExclamationCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getShippingStatusIcon = (status: string) => {
    switch (status) {
      case 'in_preparation': return <InboxOutlined />;
      case 'shipped': return <TruckOutlined />;
      case 'delivered': return <CheckCircleOutlined />;
      default: return <InboxOutlined />;
    }
  };

  const orderItemColumns = [
    {
      title: 'Product',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (_: any, record: any) => (
        <Text strong>{record.product?.name || 'Product Name'}</Text>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price: number) => `€${Number(price || 0).toFixed(2)}`,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Total',
      key: 'total',
      render: (_: any, record: any) => {
        const total = (record.unitPrice || 0) * (record.quantity || 0);
        return <Text strong>€{Number(total).toFixed(2)}</Text>;
      },
    },
  ];

  return (
    <div style={{ padding: '8px' }}>
      {/* Order Header */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              Order #{record.idOrder}
            </Title>
            <Text type="secondary">
              Created: <DateField value={record.createdAt} format="DD/MM/YYYY HH:mm" />
            </Text>
          </Col>
          <Col>
            <Space direction="vertical" align="end" size="small">
              <Tag color={getStatusColor(record.status)} icon={getStatusIcon(record.status)}>
                {record.status?.replace('_', ' ').toUpperCase()}
              </Tag>
              <Tag color={getShippingStatusColor(record.shippingStatus)} icon={getShippingStatusIcon(record.shippingStatus)}>
                {record.shippingStatus?.replace('_', ' ').toUpperCase()}
              </Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Customer Information */}
      <Card 
        title={
          <Space>
            <UserOutlined />
            Customer Information
          </Space>
        } 
        size="small" 
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Name">
            <Text strong>{record.person?.firstname} {record.person?.surname}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <Space>
              <MailOutlined />
              {record.person?.email}
            </Space>
          </Descriptions.Item>
          {record.person?.numberPhone && (
            <Descriptions.Item label="Phone">
              <Space>
                <PhoneOutlined />
                {record.person.numberPhone}
              </Space>
            </Descriptions.Item>
          )}
          {record.shippingAddress && (
            <Descriptions.Item label="Shipping Address">
              <Space align="start">
                <HomeOutlined style={{ marginTop: 4 }} />
                <div>
                  {record.shippingAddress.address}<br />
                  {record.shippingAddress.city && `${record.shippingAddress.city}, `}
                  {record.shippingAddress.postalCode && `${record.shippingAddress.postalCode}`}<br />
                  {record.shippingAddress.country}
                </div>
              </Space>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Order Details */}
      <Card 
        title={
          <Space>
            <DollarCircleOutlined />
            Order Details
          </Space>
        } 
        size="small" 
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} size="small">
          <Descriptions.Item label="Total">
            <Text strong style={{ fontSize: '16px' }}>
              €{Number(record.totalAmount || 0).toFixed(2)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Payment Method">
            {record.paymentMethod || 'Card'}
          </Descriptions.Item>
        </Descriptions>

        {record.paidAt && (
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              Paid: <DateField value={record.paidAt} format="DD/MM/YYYY HH:mm" />
            </Text>
          </div>
        )}
      </Card>

      {/* Shipping Information */}
      {(record.shippingStatus !== 'in_preparation' || record.trackingNumber || record.carrier) && (
        <Card 
          title={
            <Space>
              <TruckOutlined />
              Shipping Information
            </Space>
          } 
          size="small" 
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={1} size="small">
            {record.carrier && (
              <Descriptions.Item label="Carrier">
                <Text strong>{record.carrier}</Text>
              </Descriptions.Item>
            )}
            {record.trackingNumber && (
              <Descriptions.Item label="Tracking Number">
                <Text code copyable>{record.trackingNumber}</Text>
              </Descriptions.Item>
            )}
            {record.trackingUrl && (
              <Descriptions.Item label="Tracking URL">
                <a href={record.trackingUrl} target="_blank" rel="noopener noreferrer">
                  Track Package
                </a>
              </Descriptions.Item>
            )}
            {record.estimatedDeliveryDate && (
              <Descriptions.Item label="Estimated Delivery">
                <DateField value={record.estimatedDeliveryDate} format="DD/MM/YYYY" />
              </Descriptions.Item>
            )}
            {record.shippedAt && (
              <Descriptions.Item label="Shipped">
                <DateField value={record.shippedAt} format="DD/MM/YYYY HH:mm" />
              </Descriptions.Item>
            )}
            {record.deliveredAt && (
              <Descriptions.Item label="Delivered">
                <DateField value={record.deliveredAt} format="DD/MM/YYYY HH:mm" />
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      {/* Order Items */}
      <Card 
        title="Order Items" 
        size="small"
      >
        <Table
          dataSource={record.orderItems || []}
          columns={orderItemColumns}
          rowKey="idOrderItem"
          pagination={false}
          size="small"
          summary={(pageData: readonly any[]) => {
            const items = record.orderItems || [];
            const total = items.reduce((sum: number, item: any) => sum + (item.unitPrice || 0) * (item.quantity || 0), 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <Text strong>Total</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong>€{Number(total).toFixed(2)}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>

      {/* Notes */}
      {record.notes && (
        <Card title="Notes" size="small" style={{ marginTop: 16 }}>
          <Text>{record.notes}</Text>
        </Card>
      )}
    </div>
  );
}

export default function OrdersList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedPerson, setSelectedPerson] = useState<BaseRecord | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [shippingModalVisible, setShippingModalVisible] = useState(false);
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<BaseRecord | null>(null);
  
  // Filters
  const [searchCustomer, setSearchCustomer] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [shippingStatusFilter, setShippingStatusFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Get all data without any server-side filtering
  const { tableProps: originalTableProps, tableQueryResult } = useTable({
    syncWithLocation: false, // Disable sync since we're doing client-side filtering
  });

  // Client-side filtering of the data
  const filteredData = useMemo(() => {
    if (!originalTableProps?.dataSource) return [];
    
    return originalTableProps.dataSource.filter((order: any) => {
      const customerMatch = !searchCustomer || 
        `${order.person?.firstname} ${order.person?.surname} ${order.person?.email}`
          .toLowerCase()
          .includes(searchCustomer.toLowerCase());
      
      const statusMatch = !statusFilter || order.status === statusFilter;
      const shippingStatusMatch = !shippingStatusFilter || order.shippingStatus === shippingStatusFilter;
      
      let dateMatch = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const orderDate = dayjs(order.createdAt);
        dateMatch = orderDate.isAfter(dateRange[0].startOf("day")) && 
                   orderDate.isBefore(dateRange[1].endOf("day"));
      }

      return customerMatch && statusMatch && shippingStatusMatch && dateMatch;
    });
  }, [originalTableProps?.dataSource, searchCustomer, statusFilter, shippingStatusFilter, dateRange]);

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
          <span style={{ color: '#000000' }}>{filteredData.length}</span> {filteredData.length === 1 ? 'order' : 'orders'} in total
        </Text>
      </div>
    ),
  };

  // Handle URL-based drawer opening
  useEffect(() => {
    const showId = searchParams.get('show');
    if (showId) {
      const order = filteredData.find(o => o.idOrder === parseInt(showId));
      if (order) {
        setSelectedPerson(order);
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
    params.set('show', record.idOrder.toString());
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

  const handleChangeShippingStatus = async (record: BaseRecord, newStatus: ShippingStatus) => {
    if (record.status !== 'paid') {
      message.error('Can only update shipping status for paid orders');
      return;
    }

    setUpdatingStatus(record.idOrder);
    try {
      await orderService.updateShippingStatus(record.idOrder, { shippingStatus: newStatus });
      message.success(`Shipping status updated to ${newStatus.replace('_', ' ')}`);
      // Refresh the table data
      tableQueryResult.refetch();
    } catch (error: any) {
      message.error(error.message || 'Failed to update shipping status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleShipOrder = (record: BaseRecord) => {
    setSelectedOrderForShipping(record);
    setShippingModalVisible(true);
  };

  const handleShippingModalSuccess = async (shippingData: UpdateShippingStatusRequest) => {
    if (!selectedOrderForShipping) return;

    setUpdatingStatus(selectedOrderForShipping.idOrder);
    try {
      await orderService.updateShippingStatus(selectedOrderForShipping.idOrder, shippingData);
      message.success('Order marked as shipped successfully');
      setShippingModalVisible(false);
      setSelectedOrderForShipping(null);
      // Refresh the table data
      tableQueryResult.refetch();
    } catch (error: any) {
      message.error(error.message || 'Failed to update shipping status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleShippingModalCancel = () => {
    setShippingModalVisible(false);
    setSelectedOrderForShipping(null);
  };



  return (
    <>
      {/* Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Search customer..."
            prefix={<SearchOutlined />}
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            style={{ width: '100%' }}
          >
            <Select.Option value="" disabled style={{ color: '#bfbfbf' }}>
              Select payment status
            </Select.Option>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="payment_processing">Processing</Select.Option>
            <Select.Option value="paid">Paid</Select.Option>
            <Select.Option value="payment_failed">Failed</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
            <Select.Option value="refunded">Refunded</Select.Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            value={shippingStatusFilter}
            onChange={setShippingStatusFilter}
            allowClear
            style={{ width: '100%' }}
          >
            <Select.Option value="" disabled style={{ color: '#bfbfbf' }}>
              Select shipping status
            </Select.Option>
            <Select.Option value="in_preparation">Preparing</Select.Option>
            <Select.Option value="shipped">Shipped</Select.Option>
            <Select.Option value="delivered">Delivered</Select.Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            style={{ width: '100%' }}
            placeholder={['Start Date', 'End Date']}
            format="DD/MM/YYYY"
          />
        </Col>
      </Row>

      <List
        title={false}
        canCreate={false}
      >
        <Table {...tableProps} rowKey="idOrder">
          <Table.Column 
            dataIndex="idOrder" 
            title={"Order #"} 
            render={(value) => <Text strong>#{value}</Text>}
          />
          <Table.Column 
            title={"Customer"} 
            render={(_, record) => (
              <div>
                <div>{record.person?.firstname} {record.person?.surname}</div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {record.person?.email}
                </Text>
              </div>
            )}
          />
          <Table.Column 
            dataIndex="totalAmount" 
            title={"Total"} 
            render={(value, record) => (
              <Text strong>
                {Number(value || 0).toFixed(2)} {'€'}
              </Text>
            )}
          />
          <Table.Column
            dataIndex="status"
            title={"Payment Status"}
            render={(status) => (
              <Tag color={status === 'paid' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
                {status?.toUpperCase()}
              </Tag>
            )}
          />
          <Table.Column
            dataIndex="shippingStatus"
            title={"Shipping Status"}
            render={(status) => (
              <Tag color={status === 'delivered' ? 'green' : status === 'shipped' ? 'blue' : 'orange'}>
                {status?.replace('_', ' ').toUpperCase()}
              </Tag>
            )}
          />
          <Table.Column
            title={"Actions"}
            dataIndex="actions"
            render={(_, record: BaseRecord) => {
              const isUpdating = updatingStatus === record.idOrder;
              const canUpdateShipping = record.status === 'paid';
              
              return (
                <Space>
                  <ShowButton hideText size="small" onClick={() => handleShow(record)} />
                  
                  {canUpdateShipping && record.shippingStatus !== ShippingStatus.SHIPPED && record.shippingStatus !== ShippingStatus.DELIVERED && (
                    <Button 
                      type="primary" 
                      size="small" 
                      icon={isUpdating ? <LoadingOutlined /> : <TruckOutlined />}
                      loading={isUpdating}
                      disabled={isUpdating}
                      onClick={() => handleShipOrder(record)}
                    >
                      Ship
                    </Button>
                  )}
                  
                  {canUpdateShipping && record.shippingStatus === ShippingStatus.SHIPPED && (
                    <Popconfirm
                      title="Mark as delivered?"
                      description="This will update the shipping status to 'delivered'"
                      onConfirm={() => handleChangeShippingStatus(record, ShippingStatus.DELIVERED)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button 
                        type="primary" 
                        size="small" 
                        icon={isUpdating ? <LoadingOutlined /> : <CheckCircleOutlined />}
                        loading={isUpdating}
                        disabled={isUpdating}
                      >
                        Deliver
                      </Button>
                    </Popconfirm>
                  )}
                  
                  {!canUpdateShipping && (
                    <Tooltip title="Order must be paid before shipping">
                      <Button size="small" disabled>
                        Ship
                      </Button>
                    </Tooltip>
                  )}
                  
                  <DeleteButton hideText size="small" recordItemId={record.idOrder} />
                </Space>
              );
            }}
          />
        </Table>
      </List>

      <Drawer
        title={`Order #${selectedPerson?.idOrder} - ${selectedPerson?.person?.firstname} ${selectedPerson?.person?.surname}`}
        placement="right"
        onClose={handleClose}
        open={drawerVisible}
        width={800}
        styles={{
          body: {
            background: '#f5f5f5',
          },
        }}
      >
        {selectedPerson && <OrderDetails record={selectedPerson} />}
      </Drawer>

      <ShippingModal
        visible={shippingModalVisible}
        onCancel={handleShippingModalCancel}
        onSuccess={handleShippingModalSuccess}
        orderId={selectedOrderForShipping?.idOrder || 0}
        loading={updatingStatus === selectedOrderForShipping?.idOrder}
      />
    </>
  );
}