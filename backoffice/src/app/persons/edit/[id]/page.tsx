"use client";

import { useForm, Edit } from "@refinedev/antd";
import { Form, Input, Select, Row, Col, Card, Typography, Space, Divider, Tag } from "antd";
import { UserOutlined, CrownOutlined, ClockCircleOutlined, IdcardOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";

const { Text } = Typography;

export default function PersonEdit({ params }: { params: { id: string } }) {
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: "persons",
    action: "edit",
    id: params.id,
    onMutationSuccess: () => {
      // Vide le champ password après enregistrement
      formProps.form?.setFieldsValue({ password: undefined });
    },
  });

  const person = queryResult?.data?.data;

  const getRoleIcon = (roleTitle: string) => {
    switch (roleTitle?.toLowerCase()) {
      case 'admin':
        return <CrownOutlined style={{ color: '#faad14' }} />;
      default:
        return <UserOutlined style={{ color: '#1890ff' }} />;
    }
  };

  useEffect(() => {
    if (formProps.form && person) {
      // Supprime le champ password des valeurs du formulaire
      formProps.form.setFieldsValue({ password: undefined });
    }
  }, [person, formProps.form]);

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
              <div>{person?.idPerson}</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                {getRoleIcon(person?.role?.title)} Role
              </Text>
              <Tag color={person?.role?.title?.toLowerCase() === 'admin' ? 'gold' : 'blue'}>
                {person?.role?.title}
              </Tag>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <ClockCircleOutlined style={{ color: '#52c41a' }} /> Created
              </Text>
              <Tag color="success" style={{ margin: 0 }}>
                <div>{new Date(person?.createdAt).toLocaleString()}</div>
              </Tag>
            </div>
          </Col>
          <Col span={6}>

            <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <ClockCircleOutlined style={{ color: '#faad14' }} /> Updated
            </Text>
            <Tag color="warning" style={{ margin: 0 }}>
              <div>{new Date(person?.updatedAt).toLocaleString()}</div>
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
                label="Firstname"
                name="firstname"
                rules={[{ required: true }]}
                style={{ marginBottom: 16 }}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Surname"
                name="surname"
                rules={[{ required: true }]}
                style={{ marginBottom: 16 }}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={"Email"}
            name={["email"]}
            rules={[
              {
                required: true,
                type: "email",
                message: "Please enter a valid email address",
              },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label={"Password"}
            name={["password"]}
            rules={[{ min: 6 }]}
            style={{ marginBottom: 16 }}
            tooltip="Leave empty to keep current password"
          >
            <Input.Password size="large" placeholder="Enter new password to change" />
          </Form.Item>

          <Form.Item
            label={"Phone Number"}
            name={["numberPhone"]}
            rules={[
              { required: true, message: "Please enter a phone number" },
              {
                pattern: /^\+?[0-9]{10,15}$/,
                message: "Please enter a valid phone number",
              },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input size="large" placeholder="Enter phone number with country code" />
          </Form.Item>

          <Form.Item
            label={"Role"}
            name={["idRole"]}
            rules={[
              {
                required: true,
              },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Select
              size="large"
              options={[
                { value: 1, label: "Admin" },
                { value: 2, label: "User" },
              ]}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </div>
      </Form>
    </Edit>
  );
}
