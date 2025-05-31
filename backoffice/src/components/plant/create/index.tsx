import { useForm } from "@refinedev/antd";
import { Modal, Form, Input, Select, Row, Col, Button, Space, Card, Divider } from "antd";
import React from "react";

interface CreatePlantModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CreatePlantModal: React.FC<CreatePlantModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const { formProps, saveButtonProps } = useForm({
    resource: "plants",
    action: "create",
    redirect: false,
    onMutationSuccess: () => {
      onSuccess();
    },
  });

  return (
    <Modal
      title="Create plant"
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
        bodyStyle={{ padding: "16px 24px" }}
      >
        <Form {...formProps} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Firstname"
                name="firstname"
                rules={[{ required: true }]}
                style={{ marginBottom: 16 }}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Surname"
                name="surname"
                rules={[{ required: true }]}
                style={{ marginBottom: 16 }}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={"Email"}
            name={["email"]}
            rules={[
              {
                required: true,
                type: "email",
                message: "Please enter a valid email address",
              },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label={"Password"}
            name={["password"]}
            rules={[{ required: true, min: 6 }]}
            style={{ marginBottom: 16 }}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item
            label={"Phone Number"}
            name={["numberPhone"]}
            rules={[
              { required: true, message: "Please enter a phone number" },
              {
                pattern: /^[0-9]{10}$/,
                message: "Please enter a valid 10-digit phone number",
              },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input size="large" placeholder="Enter 10-digit phone number" />
          </Form.Item>

          <Form.Item
            label={"Role"}
            name={["idRole"]}
            initialValue={1}
            rules={[
              {
                required: true,
              },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Select
              size="large"
              options={[
                { value: 1, label: "Admin" },
                { value: 2, label: "User" },
              ]}
              style={{ width: "100%" }}
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
  );
}; 