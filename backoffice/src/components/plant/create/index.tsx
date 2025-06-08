import { useForm, useSelect } from "@refinedev/antd";
import { Modal, Form, Input, Select, Row, Col, Button, Space, Card, Divider, InputNumber } from "antd";
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
  });

  const { selectProps: objectSelectProps } = useSelect({
    resource: "objects",
    optionLabel: "title",
    optionValue: "idObject",
  });

  const { selectProps: personSelectProps } = useSelect({
    resource: "persons",
    optionLabel: "email",
    optionValue: "idPerson",
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
        styles={{ body: { padding: "16px 24px" } }}
      >
        <Form {...formProps} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true }]}
                style={{ marginBottom: 16 }}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>

              <Form.Item
                label={"Price"}
                name={["price"]}
                rules={[{ required: true }]}
                style={{ marginBottom: 16 }}
              >
                <InputNumber size="large" addonAfter="€" />
              </Form.Item></Col>
            <Col span={24}>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, min: 10 }]}
                style={{ marginBottom: 16 }}
              >
                <Input.TextArea size="large" rows={2} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={"Category"}
            name={["category"]}
            rules={[{ required: true, min: 10 }]}
            style={{ marginBottom: 16 }}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label={"Is Available"}
            name={["isAvailable"]}
            rules={[{ required: true }]}
            style={{ marginBottom: 16 }}
          >
            <Select size="large" placeholder="Is the object available ?" options={[
              { value: false, label: "No" },
              { value: true, label: "Yes" },
            ]} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={"Object"}
                name={["idObject"]}
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
                    label: `${option.label} `,
                    data: option.data
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
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