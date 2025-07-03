import { Modal, Form, Input, Select, Row, Col, Button, Space, Card, Divider, DatePicker } from "antd";
import React from "react";
import { UpdateShippingStatusRequest, ShippingStatus } from "@/interfaces/order.interface";
import dayjs from "dayjs";

interface ShippingModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (data: UpdateShippingStatusRequest) => void;
  orderId: number;
  loading?: boolean;
}

export const ShippingModal: React.FC<ShippingModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  orderId,
  loading = false,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const shippingData: UpdateShippingStatusRequest = {
        shippingStatus: ShippingStatus.SHIPPED,
        carrier: values.carrier,
        trackingNumber: values.trackingNumber,
        trackingUrl: values.trackingUrl,
        estimatedDeliveryDate: values.estimatedDeliveryDate?.toISOString(),
      };
      onSuccess(shippingData);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={`Mark Order #${orderId} as Shipped`}
      open={visible}
      onCancel={handleCancel}
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
        bodyStyle={{ padding: "16px 24px" }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Carrier"
                name="carrier"
                rules={[{ required: true, message: "Please select a carrier" }]}
                style={{ marginBottom: 16 }}
              >
                <Select
                  size="large"
                  placeholder="Select carrier"
                  options={[
                    { value: "Colissimo", label: "Colissimo" },
                    { value: "Chronopost", label: "Chronopost" },
                    { value: "DHL", label: "DHL" },
                    { value: "FedEx", label: "FedEx" },
                    { value: "UPS", label: "UPS" },
                    { value: "La Poste", label: "La Poste" },
                    { value: "Other", label: "Other" },
                  ]}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tracking Number"
                name="trackingNumber"
                rules={[{ required: true, message: "Please enter tracking number" }]}
                style={{ marginBottom: 16 }}
              >
                <Input size="large" placeholder="Enter tracking number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Tracking URL"
            name="trackingUrl"
            rules={[
              { type: "url", message: "Please enter a valid URL" }
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input 
              size="large" 
              placeholder="https://tracking.example.com/track/123456789"
            />
          </Form.Item>

          <Form.Item
            label="Estimated Delivery Date"
            name="estimatedDeliveryDate"
            rules={[
              { 
                required: true, 
                message: "Please select estimated delivery date" 
              }
            ]}
            style={{ marginBottom: 16 }}
          >
            <DatePicker
              size="large"
              style={{ width: "100%" }}
              placeholder="Select delivery date"
              disabledDate={(current) => {
                // Can't select dates in the past
                return current && current < dayjs().startOf('day');
              }}
            />
          </Form.Item>
        </Form>
      </Card>
      <Divider style={{ margin: 0 }} />
      <div style={{ padding: "12px 24px", display: "flex", justifyContent: "flex-end" }}>
        <Space>
          <Button
            onClick={handleCancel}
            size="large"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            size="large"
            loading={loading}
          >
            Mark as Shipped
          </Button>
        </Space>
      </div>
    </Modal>
  );
}; 