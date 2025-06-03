import { useForm } from "@refinedev/antd";
import { Modal, Form, Input, Select, Row, Col, Button, Space, Card, Divider } from "antd";
import React from "react";

interface CreateCategoryTypeModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CreateCategoryTypeModal: React.FC<CreateCategoryTypeModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const { formProps, saveButtonProps } = useForm({
    resource: "category-types",
    action: "create",
    redirect: false,
    onMutationSuccess: () => {
      onSuccess();
    },
  });

  return (
    <Modal
      title="Create category type"
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
          <Col span={24}>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true }]}
              style={{ marginBottom: 16 }}
            >
              <Input size="large" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true }]}
              style={{ marginBottom: 16 }}
            >
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>

          <Col span={24}>
          <Form.Item
            label={"Advice"}
            name={["advise"]}
            rules={[{ required: true }]}
            style={{ marginBottom: 16 }}
          >
            <Input.TextArea rows={2} />
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