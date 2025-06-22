import { DateField } from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Tag, Typography } from "antd";
import { MailOutlined, PhoneOutlined, ClockCircleOutlined } from "@ant-design/icons";
import React from "react";
import { DetailRow } from "@/components/common/DetailRow";
import { showDetailsStyles } from "@/styles/show-details";
import { fieldIcons } from "@/utils/icon-mapping";

interface ContactDetailsProps {
  record: BaseRecord;
}

export const ContactDetails: React.FC<ContactDetailsProps> = ({ record }) => {
  return (
    <div style={showDetailsStyles.wrapper}>
      <DetailRow icon={fieldIcons.id} label="ID">
        {record.idContact}
      </DetailRow>

      <DetailRow icon={fieldIcons.email} label="Email">
        <Space>
          <MailOutlined />
          <Typography.Text>{record.email}</Typography.Text>
        </Space>
      </DetailRow>

      <DetailRow icon={fieldIcons.firstName} label="Firstname">
        {record.firstname}
      </DetailRow>

      <DetailRow icon={fieldIcons.lastName} label="Surname">
        {record.surname}
      </DetailRow>

      <DetailRow icon={fieldIcons.phone} label="Phone Number">
        <Space>
          <PhoneOutlined />
          <Typography.Text>{record.phone || '-'}</Typography.Text>
        </Space>
      </DetailRow>

      <DetailRow icon={fieldIcons.createdAt} label="Created At">
        <Tag color="success" style={{ margin: 0 }}>
          <DateField value={record.createdAt} format="DD/MM/YYYY HH:mm" />
        </Tag>
      </DetailRow>

      <DetailRow icon={fieldIcons.updatedAt} label="Updated At">
        <Tag color="warning" style={{ margin: 0 }}>
          <DateField value={record.updatedAt} format="DD/MM/YYYY HH:mm" />
        </Tag>
      </DetailRow>
    </div>
  );
};