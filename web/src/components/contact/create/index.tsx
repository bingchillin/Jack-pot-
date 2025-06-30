import { useForm, useSelect } from "@refinedev/antd";
import { Modal, Form, Input, Row, Col, Button, Space, Card, Divider, Select, Typography } from "antd";
import React from "react";

const { Text } = Typography;

interface CreateContactModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CreateContactModal: React.FC<CreateContactModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const { formProps, saveButtonProps } = useForm({
    resource: "contacts",
    action: "create",
    redirect: false,
    onMutationSuccess: () => {
      onSuccess();
    },
  });

  const { selectProps: relationshipSelectProps } = useSelect({
    resource: "relationships",
    optionLabel: "title",
    optionValue: "idRelationship",
  });

  const { selectProps: personSelectProps } = useSelect({
    resource: "persons",
    optionLabel: "email",
    optionValue: "idPerson",
  });

  return (
    <Modal
      title="Create Contact Relationship"
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
          <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
            Create a relationship between two people. You&#39;ll need to create two contacts - one for each person&#39;s perspective of the relationship.
          </Text>

          <Form.Item
            label="Person"
            name="idPerson"
            rules={[{ required: true, message: "Please select a person" }]}
            style={{ marginBottom: 16 }}
          >
            <Select
              {...personSelectProps}
              size="large"
              placeholder="Select a person"
            />
          </Form.Item>

          <Form.Item
            label="Relationship Type"
            name="idRelationship"
            rules={[{ required: true, message: "Please select a relationship type" }]}
            style={{ marginBottom: 16 }}
          >
            <Select
              {...relationshipSelectProps}
              size="large"
              placeholder="Select relationship type"
            />
          </Form.Item>

          <Form.Item
            label="Relation Label"
            name="relation"
            tooltip="How this person refers to the relationship (e.g., 'Close friend', 'Family member')"
            style={{ marginBottom: 16 }}
          >
            <Input size="large" placeholder="e.g., Close friend, Family member" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            tooltip="Additional details about the relationship from this person's perspective"
            style={{ marginBottom: 16 }}
          >
            <Input.TextArea 
              size="large" 
              placeholder="Describe the relationship (e.g., how they met, context, etc.)"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            label="Value Return"
            name="valueReturn"
            tooltip="Optional return value for the relationship"
            style={{ marginBottom: 16 }}
          >
            <Input size="large" placeholder="Optional return value" />
          </Form.Item>

          <Form.Item
            name="isActive"
            valuePropName="checked"
            initialValue={true}
            style={{ marginBottom: 16 }}
          >
            <Select
              size="large"
              options={[
                { value: true, label: "Active" },
                { value: false, label: "Inactive" }
              ]}
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
            Create Contact
          </Button>
        </Space>
      </div>
    </Modal>
  );
}; 