"use client";

import {
  DateField,
  MarkdownField,
  NumberField,
  Show,
  TextField,
} from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { Typography } from "antd";
import React from "react";

const { Title } = Typography;

export default function PersonShow() {
  const { queryResult } = useShow({});
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.idPerson} />
      <Title level={5}>{"Email"}</Title>
      <TextField value={record?.email} />
      <Title level={5}>{"Firstname"}</Title>
      <TextField value={record?.firstname} />
      <Title level={5}>{"Surname"}</Title>
      <TextField value={record?.surname} />
      <Title level={5}>{"Is Email Verified"}</Title>
      <TextField value={record?.isEmailVerified ? "Yes" : "No"} />
      <Title level={5}>{"Role"}</Title>
      <TextField value={record?.role?.name || "User"} />
    </Show>
  );
}
