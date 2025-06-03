import { useForm } from "@refinedev/antd";
import { useSelect } from "@refinedev/antd";
import { Modal, Form, Input, Col, Button, Space, Card, Divider, Select, Row } from "antd";
import React from "react";

interface CreateObjectModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CreateObjectModal: React.FC<CreateObjectModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const { formProps, saveButtonProps } = useForm({
    resource: "objects",
    redirect: false,
    onMutationSuccess: () => {
      onSuccess();
    },
  });

  const { selectProps: categoryTypeSelectProps } = useSelect({
    resource: "category-types",
    optionLabel: "title",
    optionValue: "idCategoryType",
  });

  const { selectProps: personSelectProps } = useSelect({
    resource: "persons",
    optionLabel: "email",
    optionValue: "idPerson",
  });

  return (
    <Modal
      title="Create object"
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
            <Col span={24}>
              <Form.Item
                label={"Preference Number"}
                name={["preference_number"]}
                style={{ marginBottom: 16 }}
              >
                <Input size="large" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={"Category Type"}
                name={["idCategoryType"]}
                rules={[{ required: true, message: "Please select a category type" }]}
                style={{ marginBottom: 16 }}
              >
                <Select 
                  size="large" 
                  {...categoryTypeSelectProps}
                  placeholder="Select a category type"
                  showSearch
                  filterOption={(input, option) => {
                    const searchStr = input.toLowerCase();
                    const label = option?.label?.toLowerCase() || '';
                    return label.includes(searchStr);
                  }}
                  optionFilterProp="label"
                  options={categoryTypeSelectProps.options?.map((option: any) => ({
                    value: option.value,
                    label: `${option.label} `,
                    data: option.data
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={"Person"}
                name={["idPerson"]}
                rules={[{ required: true, message: "Please select a person" }]}
                style={{ marginBottom: 16 }}
              >
                <Select 
                  size="large" 
                  {...personSelectProps}
                  placeholder="Select a person"
                  showSearch
                  filterOption={(input, option) => {
                    const searchStr = input.toLowerCase();
                    const label = option?.label?.toLowerCase() || '';
                    return label.includes(searchStr);
                  }}
                  optionFilterProp="label"
                  options={personSelectProps.options?.map((option: any) => ({
                    value: option.value,
                    label: `${option.label} `,
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