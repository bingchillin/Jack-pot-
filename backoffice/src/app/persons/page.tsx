"use client";

import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  MarkdownField,
  ShowButton,
  TextField,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord, useMany } from "@refinedev/core";
import { Space, Table, Tag } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, CrownOutlined, UserOutlined } from "@ant-design/icons";
import React from "react";

export default function PersonList() {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  const { data: categoryData, isLoading: categoryIsLoading } = useMany({
    resource: "categories",
    ids:
      tableProps?.dataSource
        ?.map((item) => item?.category?.id)
        .filter(Boolean) ?? [],
    queryOptions: {
      enabled: !!tableProps?.dataSource,
    },
  });

  const getRoleIcon = (roleTitle: string) => {
    switch (roleTitle?.toLowerCase()) {
      case 'admin':
        return <CrownOutlined style={{ color: '#faad14' }} />;
      default:
        return <UserOutlined style={{ color: '#1890ff' }} />;
    }
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="idPerson" title={"ID"} />
        <Table.Column dataIndex="firstname" title={"Firstname"} />
        <Table.Column dataIndex="surname" title={"Surname"} />
        <Table.Column dataIndex={"email"} title={"Email"} />
        <Table.Column 
          dataIndex="isEmailVerified" 
          title={"Is Email Verified"} 
          render={(value) => (
            <Tag color={value ? "success" : "error"} icon={value ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
              {value ? "Yes" : "No"}
            </Tag>
          )} 
        />
        <Table.Column
          dataIndex="role"
          title={"Role"}
          render={(value) => (
            <Space>
              {getRoleIcon(value?.title)}
              <Tag color={value?.title?.toLowerCase() === 'admin' ? 'gold' : 'blue'}>
                {value?.title || '-'}
              </Tag>
            </Space>
          )}
        />
        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
