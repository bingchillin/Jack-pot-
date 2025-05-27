"use client";

import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
  CreateButton,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag, Drawer } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, CrownOutlined, PlusCircleOutlined, UserOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PersonDetails } from "@components/person/show";

export default function PersonList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedPerson, setSelectedPerson] = useState<BaseRecord | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  // Handle URL-based drawer opening
  useEffect(() => {
    const showId = searchParams.get('show');
    if (showId) {
      const person = tableProps?.dataSource?.find(p => p.idPerson === parseInt(showId));
      if (person) {
        setSelectedPerson(person);
        setDrawerVisible(true);
      }
    } else {
      setDrawerVisible(false);
      setSelectedPerson(null);
    }
  }, [searchParams, tableProps?.dataSource]);

  const getRoleIcon = (roleTitle: string) => {
    switch (roleTitle?.toLowerCase()) {
      case 'admin':
        return <CrownOutlined style={{ color: '#faad14' }} />;
      default:
        return <UserOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const handleShow = (record: BaseRecord) => {
    setSelectedPerson(record);
    setDrawerVisible(true);
    // Update URL with show parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('show', record.idPerson.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClose = () => {
    setDrawerVisible(false);
    setSelectedPerson(null);
    // Remove show parameter from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete('show');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      {/* Option 1: Add button outside of List component - This will definitely work */}
      <div style={{ marginBottom: '16px' }}>
        <CreateButton
          icon={<PlusCircleOutlined />}
          size="large"
          style={{
            height: "40px",
            fontWeight: 500,
          }}
        >
          Add new person
        </CreateButton>
      </div>

      <List
        title={false}
        canCreate={false}
        // Remove headerButtons completely since we moved the button outside
      >
        <Table {...tableProps} rowKey="idPerson">
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
                <EditButton hideText size="small" recordItemId={record.idPerson} />
                <ShowButton hideText size="small" onClick={() => handleShow(record)} />
                <DeleteButton hideText size="small" recordItemId={record.idPerson} />
              </Space>
            )}
          />
        </Table>
      </List>

      <Drawer
        placement="right"
        onClose={handleClose}
        open={drawerVisible}
        width={600}
        styles={{
          body: {
            background: '#f5f5f5',
            paddingTop: '48px',
          },
        }}
      >
        {selectedPerson && <PersonDetails record={selectedPerson} />}
      </Drawer>
    </>
  );
}