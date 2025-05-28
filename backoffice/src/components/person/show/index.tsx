import { DateField } from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Tag, Card, Typography, Button, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, CrownOutlined, UserOutlined, MailOutlined, PhoneOutlined, ClockCircleOutlined } from "@ant-design/icons";
import React from "react";

interface PersonDetailsProps {
  record: BaseRecord;
}

export const PersonDetails: React.FC<PersonDetailsProps> = ({ record }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const handleResendVerification = async (email: string) => {
    try {
      const response = await fetch('http://localhost:3000/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to resend verification email');
      }

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

  const containerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '24px',
    padding: '12px',
    borderBottom: '1px solid #f0f0f0',
  };

  const iconStyle = {
    fontSize: '20px',
    color: '#8c8c8c',
    marginTop: '4px',
  };

  const contentStyle = {
    flex: 1,
  };

  const labelStyle = {
    color: '#8c8c8c',
    fontSize: '12px',
    marginBottom: '4px',
  };

  const dataStyle = {
    fontSize: '14px',
    color: '#262626',
  };

  return (
    <>
      {contextHolder}
      <div style={{ background: '#fff', borderRadius: '8px' }}>
        <div style={containerStyle}>
          <div style={iconStyle}><UserOutlined /></div>
          <div style={contentStyle}>
            <Typography.Text type="secondary" style={labelStyle}>ID</Typography.Text>
            <div style={dataStyle}>{record.idPerson}</div>
          </div>
        </div>

        <div style={containerStyle}>
          <div style={iconStyle}><MailOutlined /></div>
          <div style={contentStyle}>
            <Typography.Text type="secondary" style={labelStyle}>Email</Typography.Text>
            <div style={dataStyle}>{record.email}</div>
          </div>
        </div>

        <div style={containerStyle}>
          <div style={iconStyle}><UserOutlined /></div>
          <div style={contentStyle}>
            <Typography.Text type="secondary" style={labelStyle}>Firstname</Typography.Text>
            <div style={dataStyle}>{record.firstname}</div>
          </div>
        </div>

        <div style={containerStyle}>
          <div style={iconStyle}><UserOutlined /></div>
          <div style={contentStyle}>
            <Typography.Text type="secondary" style={labelStyle}>Surname</Typography.Text>
            <div style={dataStyle}>{record.surname}</div>
          </div>
        </div>

        <div style={containerStyle}>
          <div style={iconStyle}><PhoneOutlined /></div>
          <div style={contentStyle}>
            <Typography.Text type="secondary" style={labelStyle}>Phone Number</Typography.Text>
            <div style={dataStyle}>{record.numberPhone || '-'}</div>
          </div>
        </div>

        <div style={containerStyle}>
          <div style={iconStyle}><MailOutlined /></div>
          <div style={contentStyle}>
            <Typography.Text type="secondary" style={labelStyle}>Email Verification</Typography.Text>
            <div style={dataStyle}>
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
            </div>
          </div>
        </div>

        <div style={containerStyle}>
          <div style={iconStyle}><UserOutlined /></div>
          <div style={contentStyle}>
            <Typography.Text type="secondary" style={labelStyle}>Role</Typography.Text>
            <div style={dataStyle}>
              <Space>
                {getRoleIcon(record.role?.title)}
                <Tag color={record.role?.title?.toLowerCase() === 'admin' ? 'gold' : 'blue'}>
                  {record.role?.title || 'User'}
                </Tag>
              </Space>
            </div>
          </div>
        </div>

        <div style={containerStyle}>
          <div style={iconStyle}><ClockCircleOutlined /></div>
          <div style={contentStyle}>
            <Typography.Text type="secondary" style={labelStyle}>Created At</Typography.Text>
            <div style={dataStyle}>
              <Tag color="success" style={{ margin: 0 }}>
                <DateField value={record.createdAt} format="DD/MM/YYYY HH:mm" />
              </Tag>
            </div>
          </div>
        </div>

        <div style={containerStyle}>
          <div style={iconStyle}><ClockCircleOutlined /></div>
          <div style={contentStyle}>
            <Typography.Text type="secondary" style={labelStyle}>Updated At</Typography.Text>
            <div style={dataStyle}>
              <Tag color="warning" style={{ margin: 0 }}>
                <DateField value={record.updatedAt} format="DD/MM/YYYY HH:mm" />
              </Tag>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 