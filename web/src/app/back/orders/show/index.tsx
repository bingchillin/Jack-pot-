import { DateField, Show } from "@refinedev/antd";
import { type BaseRecord, useShow } from "@refinedev/core";
import { Space, Tag, Button, message, Divider } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, UserOutlined, MailOutlined, PhoneOutlined, ClockCircleOutlined, AppstoreOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { authApi } from "@utils/api/auth";
import { DetailRow } from "@/components/common/DetailRow";
import { showDetailsStyles } from "@/styles/show-details";
import { getRoleIcon } from "@/utils/utils";
import { fieldIcons } from "@/utils/icon-mapping";
import { ObjectProfilesModal } from "./ObjectProfilesModal";

interface OrderDetailsProps {
  record: BaseRecord;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ record }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [objectProfilesModalVisible, setObjectProfilesModalVisible] = useState(false);

  const handleResendVerification = async (email: string) => {
    try {
      await authApi.resendVerification(email);
      messageApi.success('Verification email sent successfully');
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : 'Failed to send verification email');
    }
  };

  return (
    <>
      {contextHolder}
      <div style={showDetailsStyles.wrapper}>
        <DetailRow icon={fieldIcons.id} label="ID">
          {record.idOrder}
        </DetailRow>

        <DetailRow icon={fieldIcons.email} label="Email">
          {record.email}
        </DetailRow>

        <DetailRow icon={fieldIcons.firstName} label="Firstname">
          {record.firstname}
        </DetailRow>

        <DetailRow icon={fieldIcons.lastName} label="Surname">
          {record.surname}
        </DetailRow>

        <DetailRow icon={fieldIcons.phone} label="Phone Number">
          {record.numberPhone || '-'}
        </DetailRow>

        <DetailRow icon={fieldIcons.email} label="Email Verification">
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

        <DetailRow icon={fieldIcons.role} label="Role">
          <Space>
            {getRoleIcon(record.role?.title)}
            <Tag color={record.role?.title?.toLowerCase() === 'admin' ? 'gold' : 'blue'}>
              {record.role?.title || 'User'}
            </Tag>
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
      <div style={{ marginTop: 24 }}>
      <Button
        type="primary"
        icon={<AppstoreOutlined />}
        onClick={() => setObjectProfilesModalVisible(true)}
      >
        View Object Profiles
      </Button>

      <ObjectProfilesModal
        visible={objectProfilesModalVisible}
        onClose={() => setObjectProfilesModalVisible(false)}
        orderId={record.idOrder}
        orderName={`${record.firstname} ${record.surname}`}
      />
      </div>

    </>
  );
};