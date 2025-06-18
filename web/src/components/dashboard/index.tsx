"use client";

import { useApiUrl, useCustom } from "@refinedev/core";
import { Card, Col, Row, Statistic, Typography, Spin, Divider, Space } from "antd";
import { 
  TeamOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  StopOutlined, 
  CloseCircleOutlined,
  UserOutlined,
  ShopOutlined,
  AppstoreOutlined,
  BellOutlined,
  UsergroupAddOutlined,
  DatabaseOutlined,
  NotificationOutlined
} from "@ant-design/icons";
import { getHeaders } from "@/utils/api/auth";

const { Title } = Typography;

interface ContactStats {
  totalContacts: number;
  pendingRequests: number;
  acceptedContacts: number;
  blockedContacts: number;
  rejectedContacts: number;
}

interface SystemStats {
  contacts: ContactStats;
  users: {
    total: number;
  };
  plants: {
    total: number;
    available: number;
  };
  objects: {
    total: number;
    automatic: number;
  };
  notifications: {
    total: number;
    unread: number;
  };
}

export default function DashboardContent() {
  const apiUrl = useApiUrl();
  const { data, isLoading, error } = useCustom<SystemStats>({
    url: `${apiUrl}/api/stats`,
    method: "get",
    config: {
      headers: getHeaders(),
    },
  });

  const stats = data?.data;

  return (
    <div>
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "48px" }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "48px" }}>
          <Typography.Text type="danger">
            Error loading statistics. Please try again later.
          </Typography.Text>
        </div>
      ) : (
        <>
          <Space align="center" style={{ marginBottom: 16 }}>
            <UsergroupAddOutlined style={{ fontSize: 24, color: "#1890ff" }} />
            <Title level={3} style={{ margin: 0 }}>User Statistics</Title>
          </Space>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Total Users"
                  value={stats?.users.total || 0}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Total Contacts"
                  value={stats?.contacts.totalContacts || 0}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Pending Requests"
                  value={stats?.contacts.pendingRequests || 0}
                  prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Accepted Contacts"
                  value={stats?.contacts.acceptedContacts || 0}
                  prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Blocked Contacts"
                  value={stats?.contacts.blockedContacts || 0}
                  prefix={<StopOutlined style={{ color: "#ff4d4f" }} />}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Rejected Contacts"
                  value={stats?.contacts.rejectedContacts || 0}
                  prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Card>
            </Col>
          </Row>

          <Divider />

          <Space align="center" style={{ marginBottom: 16 }}>
            <DatabaseOutlined style={{ fontSize: 24, color: "#52c41a" }} />
            <Title level={3} style={{ margin: 0 }}>Plant & Object Statistics</Title>
          </Space>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Total Plants"
                  value={stats?.plants.total || 0}
                  prefix={<ShopOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Available Plants"
                  value={stats?.plants.available || 0}
                  prefix={<ShopOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Total Objects"
                  value={stats?.objects.total || 0}
                  prefix={<AppstoreOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Automatic Objects"
                  value={stats?.objects.automatic || 0}
                  prefix={<AppstoreOutlined style={{ color: "#1890ff" }} />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
          </Row>

          <Divider />

          <Space align="center" style={{ marginBottom: 16 }}>
            <NotificationOutlined style={{ fontSize: 24, color: "#faad14" }} />
            <Title level={3} style={{ margin: 0 }}>Notification Statistics</Title>
          </Space>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Total Notifications"
                  value={stats?.notifications.total || 0}
                  prefix={<BellOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Unread Notifications"
                  value={stats?.notifications.unread || 0}
                  prefix={<BellOutlined style={{ color: "#faad14" }} />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
} 