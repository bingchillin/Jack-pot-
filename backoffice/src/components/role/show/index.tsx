import { DateField } from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Tag, Typography } from "antd";
import { CrownOutlined, UserOutlined, ClockCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import React from "react";
import { DetailRow } from "@/components/common/DetailRow";
import { showDetailsStyles } from "@/styles/show-details";

interface RoleDetailsProps {
  record: BaseRecord;
}

export const RoleDetails: React.FC<RoleDetailsProps> = ({ record }) => {
  const getRoleIcon = (roleTitle: string) => {
    switch (roleTitle?.toLowerCase()) {
      case 'admin':
        return <CrownOutlined style={{ color: '#faad14' }} />;
      default:
        return <UserOutlined style={{ color: '#1890ff' }} />;
    }
  };

  return (
    <div style={showDetailsStyles.wrapper}>
      <DetailRow icon={<UserOutlined />} label="ID">
        {record.idRole}
      </DetailRow>

      <DetailRow icon={<CrownOutlined />} label="Title">
        <Space>
          {getRoleIcon(record.title)}
          <Tag color={record.title?.toLowerCase() === 'admin' ? 'gold' : 'blue'}>
            {record.title}
          </Tag>
        </Space>
      </DetailRow>

      <DetailRow icon={<InfoCircleOutlined />} label="Description">
        {record.description || '-'}
      </DetailRow>

      <DetailRow icon={<ClockCircleOutlined />} label="Created At">
        <Tag color="success" style={{ margin: 0 }}>
          <DateField value={record.createdAt} format="DD/MM/YYYY HH:mm" />
        </Tag>
      </DetailRow>

      <DetailRow icon={<ClockCircleOutlined />} label="Updated At">
        <Tag color="warning" style={{ margin: 0 }}>
          <DateField value={record.updatedAt} format="DD/MM/YYYY HH:mm" />
        </Tag>
      </DetailRow>
    </div>
  );
}; 