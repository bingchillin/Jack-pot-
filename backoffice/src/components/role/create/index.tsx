import { useForm } from "@refinedev/antd";
import { Modal, Form, Input, Select, Row, Col, Button, Space, Card, Divider, Typography } from "antd";
import React from "react";
import { ROLE_OPTIONS } from "@/utils/constants/roles";

interface CreateRoleModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const { formProps, saveButtonProps } = useForm({
    resource: "roles",
    action: "create",
    redirect: false,
    onMutationSuccess: () => {
      onSuccess();
    },
  });

  return (
    <Modal
      title="Create role"
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
        styles={{
          body: { padding: "16px 24px" },
        }}
      >
        <Form {...formProps} layout="vertical">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true }]}
                style={{ marginBottom: 16 }}
              >
                <Input size="large" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <div style={{ marginBottom: 24 }}>
                <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                  Role Icon
                </Typography.Text>
                <Select
                  style={{ width: '100%' }}
                  size="large"
                  options={ROLE_OPTIONS}
                  optionLabelProp="label"
                  optionRender={(option) => (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0' }}>
                      {option.data.icon}
                    </div>
                  )}
                />
              </div>
            </Col>
          </Row>

          <Col span={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true }]}
              style={{ marginBottom: 16 }}
            >
              <Input.TextArea rows={4} size="large" />
            </Form.Item>
          </Col>
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