import { DateField } from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Tag, Typography, Button, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, CrownOutlined, UserOutlined, MailOutlined, PhoneOutlined, ClockCircleOutlined } from "@ant-design/icons";
import React from "react";
import { authApi } from "@utils/api/auth";
import { DetailRow } from "@/components/common/DetailRow";
import { showDetailsStyles } from "@/styles/show-details";

interface PlantDetailsProps {
  record: BaseRecord;
}

export const PlantDetails: React.FC<PlantDetailsProps> = ({ record }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const handleResendVerification = async (email: string) => {
    try {
      await authApi.resendVerification(email);
      messageApi.success('Verification email sent successfully');
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : 'Failed to send verification email');
    }
  };

  const getRoleIcon = (roleTitle: string) => {
    switch (roleTitle?.toLowerCase()) {
      case 'admin':
        return <CrownOutlined style={{ color: '#faad14' }} />;
      default:
        return <UserOutlined style={{ color: '#1890ff' }} />;
    }
  };

  return (
    <>
      {contextHolder}
      <div style={showDetailsStyles.wrapper}>
        <DetailRow icon={<UserOutlined />} label="ID">
          {record.idPlant}
        </DetailRow>

        <DetailRow icon={<MailOutlined />} label="Email">
          {record.email}
        </DetailRow>

        <DetailRow icon={<UserOutlined />} label="Firstname">
          {record.firstname}
        </DetailRow>

        <DetailRow icon={<UserOutlined />} label="Surname">
          {record.surname}
        </DetailRow>

        <DetailRow icon={<PhoneOutlined />} label="Phone Number">
          {record.numberPhone || '-'}
        </DetailRow>

        <DetailRow icon={<MailOutlined />} label="Email Verification">
          <Space>
            <Tag color={record.isEmailVerified ? "success" : "error"} icon={record.isEmailVerified ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
              {record.isEmailVerified ? "Verified" : "Not Verified"}
            </Tag>
            {!record.isEmailVerified && (
              <Button
                type="link"
                icon={<MailOutlined />}
                onClick={() => handleResendVerification(record.email)}
                size="small"
              >
                Resend
              </Button>
            )}
          </Space>
        </DetailRow>

        <DetailRow icon={<UserOutlined />} label="Role">
          <Space>
            {getRoleIcon(record.role?.title)}
            <Tag color={record.role?.title?.toLowerCase() === 'admin' ? 'gold' : 'blue'}>
              {record.role?.title || 'User'}
            </Tag>
          </Space>
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
    </>
  );
}; 