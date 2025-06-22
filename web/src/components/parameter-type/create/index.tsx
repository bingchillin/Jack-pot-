import { useForm, useSelect } from "@refinedev/antd";
import { Modal, Form, Input, Select, Row, Col, Button, Space, Card, Divider } from "antd";
import React from "react";

interface CreateParameterTypeModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CreateParameterTypeModal: React.FC<CreateParameterTypeModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const { formProps, saveButtonProps } = useForm({
    resource: "person-parameter-types",
    action: "create",
    redirect: false,
    onMutationSuccess: () => {
      onSuccess();
    },
  });

  const { selectProps: personParameterTypeSelectProps } = useSelect({
    resource: "person-parameter-types",
    optionLabel: "title",
    optionValue: "idPersonParameterType"
  });

  return (
    <Modal
      title="Create parameter type"
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
            <Col span={24}>
              <Form.Item
                label={"Person Parameter Type"}
                name="idPersonParameterType"
                rules={[{ required: true, message: "Please select a parameter type" }]}
                style={{ marginBottom: 16 }}
              >
                <Select
                  size="large"
                  {...personParameterTypeSelectProps}
                  placeholder="Select a person parameter type"
                  showSearch
                  filterOption={(input, option) => {
                    const searchStr = input.toLowerCase();
                    const label = option?.label?.toLowerCase() || '';
                    return label.includes(searchStr);
                  }}
                  optionFilterProp="label"
                  options={personParameterTypeSelectProps.options?.map((option: any) => ({
                    value: option.value,
                    label: option.data?.title || option.label || 'Untitled Person Parameter Type',
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