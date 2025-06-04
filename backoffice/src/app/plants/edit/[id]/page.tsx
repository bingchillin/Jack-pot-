"use client";

import { useForm, Edit, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Row, Col, Typography, Divider, Tag, InputNumber } from "antd";
import { ClockCircleOutlined, IdcardOutlined } from "@ant-design/icons";
import React from "react";

const { Text } = Typography;

export default function PlantEdit({ params }: { params: { id: string } }) {
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: "plants",
    action: "edit",
    id: params.id,
  });

  const plant = queryResult?.data?.data;

  const { selectProps: personSelectProps } = useSelect({
    resource: "persons",
    optionLabel: "email",
    optionValue: "idPerson",
  });

  const { selectProps: objectSelectProps } = useSelect({
    resource: "objects",
    optionLabel: "title",
    optionValue: "idObject",
  });


  return (
    <Edit
      saveButtonProps={saveButtonProps}
    >
      <Form {...formProps} layout="vertical">
        {/* Read-only Information Section */}
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <IdcardOutlined /> ID
              </Text>
              <div>{plant?.idPlant}</div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <ClockCircleOutlined style={{ color: '#52c41a' }} /> Created
              </Text>
              <Tag color="success" style={{ margin: 0 }}>
                <div>{new Date(plant?.createdAt).toLocaleString()}</div>
              </Tag>
            </div>
          </Col>
          <Col span={8}>

            <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <ClockCircleOutlined style={{ color: '#faad14' }} /> Updated
            </Text>
            <Tag color="warning" style={{ margin: 0 }}>
              <div>{new Date(plant?.updatedAt).toLocaleString()}</div>
            </Tag>
          </Col>
        </Row>

        <Divider style={{ marginTop: "0px", marginBottom: "24px" }} />

        {/* Editable Fields Section */}
        <div>
          <Text type="secondary" style={{ fontSize: 14, marginBottom: 16, display: "block" }}>
            Edit Information
          </Text>
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
                label="Price"
                name="price"
                rules={[{ required: true }]}
                style={{ marginBottom: 16, width: "100%" }}
              >
                <InputNumber size="large" addonAfter="€" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={"Description"}
            name={["description"]}
            rules={[
              {
                required: true,
                min: 10
              },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input.TextArea size="large" rows={2} />
          </Form.Item>

          <Form.Item
            label={"Category"}
            name={["category"]}
            rules={[{ required: true, min: 10 }]}
            style={{ marginBottom: 16 }}
          >
            <Input.TextArea size="large" />
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

          <div>
            <Text type="secondary" style={{ fontSize: 14, marginBottom: 16, display: "block" }}>
              Edit links to Object and Person
            </Text>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Object"
                  name={["object", "idObject"]}
                  rules={[{ required: true, message: "Please select an object" }]}
                  style={{ marginBottom: 16 }}
                >
                  <Select
                    size="large"
                    {...objectSelectProps}
                    placeholder="Select an object"
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
                  label="Person"
                  name={["person", "idPerson"]}
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
                    options={personSelectProps.options?.map((option: any) => {
                      const hasName = option.data?.firstname || option.data?.surname;
                      return {
                        value: option.value,
                        label: hasName
                          ? `${option.label} (${option.data?.firstname || ''} ${option.data?.surname || ''})`
                          : option.label,
                        data: option.data
                      };
                    })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>
      </Form>
    </Edit>
  );
}
