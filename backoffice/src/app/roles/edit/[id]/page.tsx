"use client";

import { useForm, Edit } from "@refinedev/antd";
import { Form, Input, Select, Row, Col, Typography, Divider, Tag } from "antd";
import { UserOutlined, CrownOutlined, ClockCircleOutlined, IdcardOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";

const { Text } = Typography;

export default function RoleEdit({ params }: { params: { id: string } }) {
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: "roles",
    action: "edit",
    id: params.id
  });

  const role = queryResult?.data?.data;

  const getRoleIcon = (roleTitle: string) => {
    switch (roleTitle?.toLowerCase()) {
      case 'admin':
        return <CrownOutlined style={{ color: '#faad14' }} />;
      default:
        return <UserOutlined style={{ color: '#1890ff' }} />;
    }
  };

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
              <div>{role?.idRole}</div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <ClockCircleOutlined style={{ color: '#52c41a' }} /> Created
              </Text>
              <Tag color="success" style={{ margin: 0 }}>
                <div>{new Date(role?.createdAt).toLocaleString()}</div>
              </Tag>
            </div>
          </Col>
          <Col span={8}>

            <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <ClockCircleOutlined style={{ color: '#faad14' }} /> Updated
            </Text>
            <Tag color="warning" style={{ margin: 0 }}>
              <div>{new Date(role?.updatedAt).toLocaleString()}</div>
            </Tag>
          </Col>
        </Row>

        <Divider style={{ marginTop: "0px", marginBottom: "24px" }} />


        {/* Editable Fields Section */}
        <div>
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
            
          </Row>
          <Col span={24}>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true }]}
                style={{ marginBottom: 16 }}
              >
                <Input.TextArea rows={4} size="large" />
              </Form.Item>
            </Col>
        </div>
      </Form>
    </Edit>
  );
}
