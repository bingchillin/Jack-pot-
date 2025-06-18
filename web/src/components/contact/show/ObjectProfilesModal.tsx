import { Modal, Table, Space, Tag, Typography, Button, Empty } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { getIcon } from "@/utils/icon-mapping";
import type { BaseRecord } from "@refinedev/core";
import { useEffect, useState } from "react";
import { getHeaders } from "@/utils/api/auth";

const { Text } = Typography;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ObjectProfilesModalProps {
  visible: boolean;
  onClose: () => void;
  contactId: number;
  contactName: string;
}

export const ObjectProfilesModal: React.FC<ObjectProfilesModalProps> = ({
  visible,
  onClose,
  contactId,
  contactName,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [objectProfiles, setObjectProfiles] = useState<BaseRecord[]>([]);

  useEffect(() => {
    if (visible && contactId) {
      fetchObjectProfiles();
    }
  }, [visible, contactId]);

  const fetchObjectProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/contact/${contactId}/object-profiles`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch object profiles');
      const data = await response.json();
      setObjectProfiles(data);
    } catch (error) {
      console.error('Error fetching object profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStateTag = (state: number) => {
    const states = {
      0: { color: 'default', text: 'Default' },
      1: { color: 'processing', text: 'Active' },
      2: { color: 'warning', text: 'Warning' },
      3: { color: 'error', text: 'Error' }
    };
    const stateInfo = states[state as keyof typeof states] || states[0];
    return <Tag color={stateInfo.color}>{stateInfo.text}</Tag>;
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: BaseRecord) => (
        <Space>
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Object",
      dataIndex: ["object", "title"],
      key: "object",
      render: (text: string, record: BaseRecord) => (
        <Space>
          <Text>{text || '-'}</Text>
        </Space>
      ),
    },
    {
      title: "Plant Type",
      dataIndex: ["plantType", "title"],
      key: "plantType",
      render: (text: string, record: BaseRecord) => (
        <Space>
          {getIcon("plantType")}
          <Text>{text || '-'}</Text>
        </Space>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: BaseRecord) => (
        <Space>
          {getStateTag(record.state || 0)}
          {record.isAutomatic && (
            <Tag color="success" icon={getIcon("automatic")}>
              Automatic
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={`${contactName}'s Object Profiles`}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Text>Loading object profiles...</Text>
        </div>
      ) : objectProfiles.length === 0 ? (
        <Empty
          description={
            <Text type="secondary">
              No object profiles found for this contact
            </Text>
          }
        />
      ) : (
        <Table
          dataSource={objectProfiles}
          columns={columns}
          rowKey="idObjectProfile"
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
          }}
          size="small"
        />
      )}
    </Modal>
  );
}; 