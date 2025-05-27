"use client";

import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Row, Col, } from "antd";
import React from "react";

export default function PersonCreate() {
  const { formProps, saveButtonProps } = useForm({});

  const { selectProps: categorySelectProps } = useSelect({
    resource: "categories",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Firstname"
              name="firstname"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Surname"
              name="surname"
              rules={[{ required: true }]}
            >
              <Input />
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
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={"Password"}
          name={["password"]}
          rules={[{ required: true, min: 6 }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label={"Phone Number"}
          name={["numberPhone"]}
          rules={[
            { required: true, message: "Please enter a phone number" },
            {
              pattern: /^[0-9]{10}$/,
              message: "Please enter a valid 10-digit phone number",
            },
          ]}
        >
          <Input placeholder="Enter 10-digit phone number" />
        </Form.Item>
        <Form.Item
          label={"Role"}
          name={["idRole"]}
          initialValue={1}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            options={[
              { value: 1, label: "User" },
              { value: 2, label: "Admin" },
            ]}
            style={{ width: 120 }}
          />
        </Form.Item>
      </Form>
    </Create>
  );
}
