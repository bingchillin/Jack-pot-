import React from "react";
import { Card, Space, Tag, Typography, Button, Row, Col } from "antd";
import { type BaseRecord } from "@refinedev/core";
import { UserOutlined, MailOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useDelete, useUpdate } from "@refinedev/core";
import { useNotification } from "@refinedev/core";
import { DetailRow } from "@/components/common/DetailRow";
import { showDetailsStyles } from "@/styles/show-details";
import { fieldIcons } from "@/utils/icon-mapping";

const { Text, Title } = Typography;

interface ContactDetailsProps {
    record: BaseRecord;
    onStatusChange?: () => void;
}

export const ContactDetails: React.FC<ContactDetailsProps> = ({ record, onStatusChange }) => {
    const { mutate: update } = useUpdate();
    const { mutate: deleteContact } = useDelete();
    const { open } = useNotification();

    const getStatusTag = (status: string) => {
        const statusColors = {
            pending: 'warning',
            accepted: 'success',
            rejected: 'error',
            blocked: 'error'
        };
        return (
            <Tag color={statusColors[status as keyof typeof statusColors] || 'default'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Tag>
        );
    };

    const handleStatusChange = (newStatus: string) => {
        if (!record.id) return;
        update(
            {
                resource: "contacts",
                id: record.id,
                values: { status: newStatus },
            },
            {
                onSuccess: () => {
                    open?.({
                        type: "success",
                        message: "Contact status updated successfully",
                    });
                    onStatusChange?.();
                },
                onError: (error) => {
                    open?.({
                        type: "error",
                        message: "Error updating contact status",
                        description: error.message,
                    });
                },
            }
        );
    };

    const handleDelete = () => {
        if (!record.id) return;
        deleteContact(
            {
                resource: "contacts",
                id: record.id,
            },
            {
                onSuccess: () => {
                    open?.({
                        type: "success",
                        message: "Contact deleted successfully",
                    });
                    onStatusChange?.();
                },
                onError: (error) => {
                    open?.({
                        type: "error",
                        message: "Error deleting contact",
                        description: error.message,
                    });
                },
            }
        );
    };

    return (
        <div>
            <Title level={5} style={{ marginBottom: 16, textAlign: "center" }}>Actions</Title>
            <Space wrap style={{ justifyContent: "center", display: "flex", alignItems: "center", paddingBottom: 24 }}>
                {record.status === "pending" && (
                    <>
                        <Button type="primary" onClick={() => handleStatusChange("accepted")}>
                            Accept Request
                        </Button>
                        <Button danger onClick={() => handleStatusChange("rejected")}>
                            Reject Request
                        </Button>
                    </>
                )}
                {record.status === "accepted" && (
                    <Button danger onClick={() => handleStatusChange("blocked")}>
                        Block Contact
                    </Button>
                )}
                {record.status === "blocked" && (
                    <Button onClick={() => handleStatusChange("unblocked")}>
                        Unblock Contact
                    </Button>
                )}
                <Button danger onClick={handleDelete}>
                    Delete Contact
                </Button>
            </Space>
            <div style={showDetailsStyles.wrapper}>
                <DetailRow icon={fieldIcons.id} label="Contact ID">
                    <Text>{record.id}</Text>
                </DetailRow>

                <DetailRow icon={fieldIcons.status} label="Status">
                    {getStatusTag(record.status)}
                </DetailRow>

                <DetailRow icon={fieldIcons.createdAt} label="Created At">
                    <Tag color="success" style={{ margin: 0 }}>
                        {new Date(record.createdAt).toLocaleString()}
                    </Tag>
                </DetailRow>

                <DetailRow icon={fieldIcons.updatedAt} label="Updated At">
                    <Tag color="warning" style={{ margin: 0 }}>
                        {new Date(record.updatedAt).toLocaleString()}
                    </Tag>
                </DetailRow>


            </div>
            <div style={{ ...showDetailsStyles.wrapper, marginTop: 24 }}>
                <Row>
                    <Col span={12}>
                        <Title level={5} style={{ marginTop: 24, marginBottom: 16, textAlign: "center" }}>Requester Information</Title>
                        <DetailRow icon={fieldIcons.id} label="User ID">
                            <Text>{record.requester?.id}</Text>
                        </DetailRow>

                        <DetailRow icon={fieldIcons.firstName} label="Name">
                            <Text>{`${record.requester?.firstname} ${record.requester?.surname}`}</Text>
                        </DetailRow>

                        <DetailRow icon={fieldIcons.email} label="Email">
                            <Text copyable>{record.requester?.email}</Text>
                        </DetailRow>
                    </Col>
                    <Col span={12}>

                        <Title level={5} style={{ marginTop: 24, marginBottom: 16, textAlign: "center" }}>Receiver Information</Title>
                        <DetailRow icon={fieldIcons.id} label="User ID">
                            <Text>{record.receiver?.id}</Text>
                        </DetailRow>

                        <DetailRow icon={fieldIcons.firstName} label="Name">
                            <Text>{`${record.receiver?.firstname} ${record.receiver?.surname}`}</Text>
                        </DetailRow>

                        <DetailRow icon={fieldIcons.email} label="Email">
                            <Text copyable>{record.receiver?.email}</Text>
                        </DetailRow>
                    </Col>
                </Row>
            </div>

        </div>
    );
}; 