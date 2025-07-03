"use client";

import { useForm, Edit } from "@refinedev/antd";
import { Form, Input, Row, Col, Typography, Divider, Tag, InputNumber, Switch, Upload, Space, Button, message } from "antd";
import { ClockCircleOutlined, IdcardOutlined, UploadOutlined } from "@ant-design/icons";
import React, { useState } from "react";

const { Text } = Typography;

export default function ProductEdit({ params }: { params: { id: string } }) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [messageApi, contextHolder] = message.useMessage();

  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: "products",
    action: "edit",
    id: params.id,
  });

  const product = queryResult?.data?.data;

  // Update imageUrl when product data is loaded
  React.useEffect(() => {
    if (product?.imageUrl) {
      setImageUrl(product.imageUrl);
    }
  }, [product?.imageUrl]);

  const handleImageUpload = (info: any) => {
    if (info.file.status === 'done') {
      messageApi.success(`${info.file.name} file uploaded successfully`);
      setImageUrl(info.file.response.url); // Assuming the API returns {url: "..."}
      // Update the form field with the uploaded URL
      formProps.form?.setFieldValue('imageUrl', info.file.response.url);
    } else if (info.file.status === 'error') {
      messageApi.error(`${info.file.name} file upload failed.`);
    }
  };

  const uploadProps = {
    name: 'file',
    action: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/upload`,
    headers: {
      authorization: 'authorization-text',
    },
    onChange: handleImageUpload,
    accept: 'image/*',
  };

  return (
    <>
      {contextHolder}
      <Edit
        saveButtonProps={saveButtonProps}
      >
        <Form {...formProps} layout="vertical">
          {/* Read-only Information Section */}
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                  <IdcardOutlined /> ID
                </Text>
                <div>{product?.idProduct}</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                  <ClockCircleOutlined style={{ color: '#52c41a' }} /> Created
                </Text>
                <Tag color="success" style={{ margin: 0 }}>
                  <div>{new Date(product?.createdAt).toLocaleString()}</div>
                </Tag>
              </div>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <ClockCircleOutlined style={{ color: '#faad14' }} /> Updated
              </Text>
              <Tag color="warning" style={{ margin: 0 }}>
                <div>{new Date(product?.updatedAt).toLocaleString()}</div>
              </Tag>
            </Col>
          </Row>

          <Divider style={{ marginTop: "0px", marginBottom: "24px" }} />

          {/* Editable Fields Section */}
          <div>
            <Text type="secondary" style={{ fontSize: 14, marginBottom: 16, display: "block" }}>
              Edit Information
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[{ required: true, message: "Please enter product name" }]}
                  style={{ marginBottom: 16 }}
                >
                  <Input size="large" placeholder="Enter product name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="SKU"
                  name="sku"
                  rules={[{ required: true, message: "Please enter SKU" }]}
                  style={{ marginBottom: 16 }}
                >
                  <Input size="large" placeholder="Enter SKU" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Price"
                  name="price"
                  rules={[{ required: true, message: "Please enter price" }]}
                  style={{ marginBottom: 16 }}
                >
                  <InputNumber 
                    size="large" 
                    addonAfter="€" 
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    placeholder="0.00"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Stock Quantity"
                  name="stockQuantity"
                  rules={[{ required: true, message: "Please enter stock quantity" }]}
                  style={{ marginBottom: 16 }}
                >
                  <InputNumber 
                    size="large" 
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="0"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: false }]}
              style={{ marginBottom: 16 }}
            >
              <Input.TextArea size="large" rows={3} placeholder="Enter product description" />
            </Form.Item>

            <Form.Item
              label="Product Image"
              name="imageUrl"
              rules={[{ required: false }]}
              style={{ marginBottom: 16 }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Upload {...uploadProps} listType="picture" maxCount={1}>
                  <Button icon={<UploadOutlined />} size="large" style={{ width: '100%' }}>
                    Upload Image
                  </Button>
                </Upload>
                <Input 
                  size="large" 
                  placeholder="Or enter image URL directly" 
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    formProps.form?.setFieldValue('imageUrl', e.target.value);
                  }}
                />
              </Space>
            </Form.Item>

            <Form.Item
              label="Active Status"
              name="isActive"
              valuePropName="checked"
              style={{ marginBottom: 16 }}
            >
              <Switch 
                checkedChildren="Active" 
                unCheckedChildren="Inactive"
              />
            </Form.Item>
          </div>
        </Form>
      </Edit>
    </>
  );
} 