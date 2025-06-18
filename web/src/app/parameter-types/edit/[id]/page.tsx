"use client";

import { useForm, Edit, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Row, Col, Typography, Divider, Tag } from "antd";
import { ClockCircleOutlined, IdcardOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";
import type { BaseRecord } from "@refinedev/core";

const { Text } = Typography;

export default function ParameterTypeEdit({ params }: { params: { id: string } }) {
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: "parameter-types",
    action: "edit",
    id: params.id,
  });

  const parameterType = queryResult?.data?.data as BaseRecord;

  // Set initial values when data is loaded
  useEffect(() => {
    if (parameterType) {
      formProps.form?.setFieldsValue({
        idParameterType: parameterType.idParameterType
      });
    }
  }, [parameterType, formProps.form]);

  const { selectProps: parameterTypeSelectProps } = useSelect({
    resource: "parameter-types",
    optionLabel: "title",
    optionValue: "idParameterType"
  });

  const { selectProps: plantTypeSelectProps } = useSelect({
    resource: "plant-types",
    optionLabel: "title",
    optionValue: "idPlantType"
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
              <div>{parameterType?.idParameterType}</div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <ClockCircleOutlined style={{ color: '#52c41a' }} /> Created
              </Text>
              <Tag color="success" style={{ margin: 0 }}>
                <div>{new Date(parameterType?.createdAt).toLocaleString()}</div>
              </Tag>
            </div>
          </Col>
          <Col span={8}>

            <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <ClockCircleOutlined style={{ color: '#faad14' }} /> Updated
            </Text>
            <Tag color="warning" style={{ margin: 0 }}>
              <div>{new Date(parameterType?.updatedAt).toLocaleString()}</div>
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
                required: true,
              },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={"Parameter Type"}
                name="idParameterType"
                rules={[{ required: true }]}
                style={{ marginBottom: 16 }}
              >
                <Select
                  size="large"
                  {...parameterTypeSelectProps}
                  placeholder="Select a parameter type"
                  showSearch
                  filterOption={(input, option) => {
                    const searchStr = input.toLowerCase();
                    const label = option?.label?.toLowerCase() || '';
                    return label.includes(searchStr);
                  }}
                  optionFilterProp="label"
                  options={parameterTypeSelectProps.options?.map((option: any) => ({
                    value: option.value,
                    label: option.data?.title || option.label || 'Untitled Parameter Type',
                    data: option.data
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={"Plant Type"}
                name="idPlantType"
                rules={[
                  { required: true }
                ]}
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


        </div>
      </Form>
    </Edit>
  );
}
