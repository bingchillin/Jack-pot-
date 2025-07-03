import { useForm } from "@refinedev/antd";
import { Modal, Form, Input, Select, Row, Col, Button, Space, Card, Divider, InputNumber, Switch, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import React, { useState } from "react";

interface CreateProductModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [messageApi, contextHolder] = message.useMessage();

  const { formProps, saveButtonProps } = useForm({
    resource: "products",
    action: "create",
    redirect: false,
    onMutationSuccess: () => {
      onSuccess();
    },
  });

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
      <Modal
        title="Create product"
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={600}
      styles={{
        body: {
          padding: 0,
        },
        header: {
          padding: "12px 24px",
          margin: 0,
        },
      }}
    >
      <Divider style={{ margin: 0 }} />
      <Card
        style={{
          border: "none",
          boxShadow: "none",
        }}
        styles={{ body: { padding: "16px 24px" } }}
      >
        <Form {...formProps} layout="vertical">
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
            initialValue={true}
            style={{ marginBottom: 16 }}
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive"
            />
          </Form.Item>
        </Form>
      </Card>
      <Divider style={{ margin: 0 }} />
      <div style={{ padding: "12px 24px", display: "flex", justifyContent: "flex-end" }}>
        <Space>
          <Button
            onClick={onCancel}
            size="large"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            {...saveButtonProps}
          >
            Save
          </Button>
        </Space>
      </div>
      </Modal>
    </>
  );
}; 