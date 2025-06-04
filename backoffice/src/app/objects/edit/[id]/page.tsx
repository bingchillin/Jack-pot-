"use client";

import { useForm, Edit, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Row, Col, Typography, Divider, Tag } from "antd";
import { ClockCircleOutlined, IdcardOutlined } from "@ant-design/icons";
import React from "react";

const { Text } = Typography;

export default function ObjectEdit({ params }: { params: { id: string } }) {
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: "objects",
    action: "edit",
    id: params.id
  });

  const object = queryResult?.data?.data;

  // Debug: Log the object data to see the actual field names
  console.log("Object data:", object);

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
              <div>{object?.idObject}</div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <ClockCircleOutlined style={{ color: '#52c41a' }} /> Created
              </Text>
              <Tag color="success" style={{ margin: 0 }}>
                <div>{new Date(object?.createdAt).toLocaleString()}</div>
              </Tag>
            </div>
          </Col>
          <Col span={8}>
            <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <ClockCircleOutlined style={{ color: '#faad14' }} /> Updated
            </Text>
            <Tag color="warning" style={{ margin: 0 }}>
              <div>{new Date(object?.updatedAt).toLocaleString()}</div>
            </Tag>
          </Col>
        </Row>

        <Divider style={{ marginTop: "0px", marginBottom: "24px" }} />

        {/* Editable Fields Section */}
        <div style={{ marginBottom: 24 }}>
          <Text type="secondary" style={{ fontSize: 14, marginBottom: 16, display: "block" }}>
            Edit Information
          </Text>

          <Form.Item
            label={"Title"}
            name={["title"]}
            rules={[
              {
                required: true,
                // Fixed: Remove email validation for title field
                message: "Please enter a title",
              },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label={"Description"}
            name={["description"]}
            rules={[{ required: true }]}
            style={{ marginBottom: 16 }}
          >
            <Input.TextArea rows={2} size="large" />
          </Form.Item>

          <Form.Item
            label={"Advice"}
            name={["advise"]}
            rules={[
              { required: true }
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input.TextArea rows={2} size="large" />
          </Form.Item>

          <Form.Item
            label={"Preference Number"}
            name={["preference_number"]}
            style={{ marginBottom: 16 }}
          >
            <Input size="large" />
          </Form.Item>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 14, marginBottom: 16, display: "block" }}>
            Edit links to Category Type and Person
          </Text>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Category Type"
                name="idCategoryType"
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
      </Form>
    </Edit>
  );
}