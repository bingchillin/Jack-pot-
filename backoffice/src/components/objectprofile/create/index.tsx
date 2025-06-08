import { useForm, useSelect } from "@refinedev/antd";
import { Modal, Form, Input, Select, Row, Col, Button, Space, Card, Divider } from "antd";
import React from "react";

interface CreateObjectprofileModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CreateObjectprofileModal: React.FC<CreateObjectprofileModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const { formProps, saveButtonProps } = useForm({
    resource: "object-profiles",
    action: "create",
    redirect: false,
    onMutationSuccess: () => {
      onSuccess();
    },
  });

  const { selectProps: objectSelectProps } = useSelect({
    resource: "objects",
    optionLabel: "title",
    optionValue: "idObject"
  });

  const { selectProps: plantTypeSelectProps } = useSelect({
    resource: "plant-types",
    optionLabel: "title",
    optionValue: "idPlantType"
  });

  return (
    <Modal
      title="Create object profile"
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
          </Row>

          <Form.Item
            label={"Advice"}
            name={["advise"]}
            rules={[
              {
                required: true
              },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={"Object"}
                name="idObject"
                rules={[{ required: true, message: "Please select a object" }]}
                style={{ marginBottom: 16 }}
              >
                <Select
                  size="large"
                  {...objectSelectProps}
                  placeholder="Select a object"
                  showSearch
                  filterOption={(input, option) => {
                    const searchStr = input.toLowerCase();
                    const label = option?.label?.toLowerCase() || '';
                    return label.includes(searchStr);
                  }}
                  optionFilterProp="label"
                  options={objectSelectProps.options?.map((option: any) => ({
                    value: option.value,
                    label: option.data?.title || option.label || 'Untitled Object',
                    data: option.data
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={"Plant Type"}
                name="idPlantType"
                rules={[{ required: true, message: "Please select a plant type" }]}
                style={{ marginBottom: 16 }}
              >
                <Select
                  size="large"
                  {...plantTypeSelectProps}
                  placeholder="Select a plant type"
                  showSearch
                  filterOption={(input, option) => {
                    const searchStr = input.toLowerCase();
                    const label = option?.label?.toLowerCase() || '';
                    return label.includes(searchStr);
                  }}
                  optionFilterProp="label"
                  options={plantTypeSelectProps.options?.map((option: any) => ({
                    value: option.value,
                    label: option.data?.title || option.label || 'Untitled Plant Type',
                    data: option.data
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
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