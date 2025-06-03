"use client";

import { useForm, Edit } from "@refinedev/antd";
import { Form, Input, Select, Row, Col, Card, Typography, Space, Divider, Tag } from "antd";
import { UserOutlined, CrownOutlined, ClockCircleOutlined, IdcardOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";

const { Text } = Typography;

export default function CategoryTypeEdit({ params }: { params: { id: string } }) {
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: "category-types",
    action: "edit",
    id: params.id,
  });

  const categoryType = queryResult?.data?.data;

  return (
    <Edit
      saveButtonProps={saveButtonProps}
    >
      <Form {...formProps} layout="vertical">
        {/* Read-only Information Section */}
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <IdcardOutlined /> ID
              </Text>
              <div>{categoryType?.idCategoryType}</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <ClockCircleOutlined style={{ color: '#52c41a' }} /> Created
              </Text>
              <Tag color="success" style={{ margin: 0 }}>
                <div>{new Date(categoryType?.createdAt).toLocaleString()}</div>
              </Tag>
            </div>
          </Col>
          <Col span={6}>

            <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <ClockCircleOutlined style={{ color: '#faad14' }} /> Updated
            </Text>
            <Tag color="warning" style={{ margin: 0 }}>
              <div>{new Date(categoryType?.updatedAt).toLocaleString()}</div>
            </Tag>
          </Col>
        </Row>

        <Divider style={{ marginTop: "0px", marginBottom: "24px" }} />

        {/* Editable Fields Section */}
        <div>
          <Text type="secondary" style={{ fontSize: 14, marginBottom: 16, display: "block" }}>
            Edit Information
          </Text>
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

          <Form.Item
            label={"Advice"}
            name={["advise"]}
            rules={[{ required: true }]}
            style={{ marginBottom: 16 }}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
        </div>
      </Form>
    </Edit>
  );
}
