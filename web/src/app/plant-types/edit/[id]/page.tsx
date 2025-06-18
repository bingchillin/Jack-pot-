"use client";

import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Row, Col, Typography, Divider, Button, Space, Select } from "antd";
import { useRouter } from "next/navigation";
import { ExperimentOutlined, EnvironmentOutlined, FieldTimeOutlined, InfoCircleOutlined, BarsOutlined, RedoOutlined } from "@ant-design/icons";
import React from "react";
import { seasons, seasonColors } from "@/utils/api/enum";

const { Text } = Typography;

export default function PlantTypeEdit({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { formProps, saveButtonProps } = useForm({
        resource: "plant-types",
        action: "edit",
        id: params.id,
    });

    const seasonOptions = Object.entries(seasons).map(([key, value]) => ({
        value,
        label: value,
        color: seasonColors[key as keyof typeof seasonColors]
    }));

    return (
        <Edit
            headerButtons={[
                <Button
                    key="list"
                    type="default"
                    icon={<BarsOutlined />}
                    onClick={() => router.push('/plant-types')}
                >
                    Plant Types
                </Button>
            ]}
            saveButtonProps={saveButtonProps}
        >
            <Form {...formProps} layout="vertical">
                {/* Basic Information Section */}
                <div>
                    <Text type="secondary" style={{ fontSize: 14, marginBottom: 16, display: "block" }}>
                        Basic Information
                    </Text>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Title"
                                name="title"
                                rules={[{ required: true }]}
                                style={{ marginBottom: 16 }}
                            >
                                <Input size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Scientific Name"
                                name="scientistName"
                                rules={[{ required: true }]}
                                style={{ marginBottom: 16 }}
                            >
                                <Input size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Family Name"
                                name="familyName"
                                rules={[{ required: true }]}
                                style={{ marginBottom: 16 }}
                            >
                                <Input size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Type Name"
                                name="typeName"
                                rules={[{ required: true }]}
                                style={{ marginBottom: 16 }}
                            >
                                <Input size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true }]}
                        style={{ marginBottom: 16 }}
                    >
                        <Input.TextArea rows={4} size="large" />
                    </Form.Item>
                </div>

                <Divider style={{ marginTop: "0px", marginBottom: "24px" }} />

                {/* Growing Conditions Section */}
                <div>
                    <Text type="secondary" style={{ fontSize: 14, marginBottom: 16, display: "block" }}>
                        <EnvironmentOutlined /> Growing Conditions
                    </Text>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Exposition Type"
                                name="expositionType"
                                rules={[{ required: true }]}
                                style={{ marginBottom: 16 }}
                            >
                                <Input size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Ground Type"
                                name="groundType"
                                rules={[{ required: true }]}
                                style={{ marginBottom: 16 }}
                            >
                                <Input size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Plantation Season"
                        name="plantationSaison"
                        rules={[{ required: true }]}
                        style={{ marginBottom: 16 }}
                    >
                        <Select
                            options={seasonOptions}
                            optionRender={(option) => (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ 
                                        width: 12, 
                                        height: 12, 
                                        borderRadius: '50%', 
                                        backgroundColor: option.data.color,
                                        marginRight: 8 
                                    }} />
                                    {option.label}
                                </div>
                            )}
                        />
                    </Form.Item>
                </div>

                <Divider style={{ marginTop: "0px", marginBottom: "24px" }} />

                {/* Growing Seasons Section */}
                <div>
                    <Text type="secondary" style={{ fontSize: 14, marginBottom: 16, display: "block" }}>
                        <FieldTimeOutlined /> Growing Seasons
                    </Text>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="First Season"
                                name="saisonFirst"
                                style={{ marginBottom: 16 }}
                            >
                                <Select
                                    options={seasonOptions}
                                    optionRender={(option) => (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ 
                                                width: 12, 
                                                height: 12, 
                                                borderRadius: '50%', 
                                                backgroundColor: option.data.color,
                                                marginRight: 8 
                                            }} />
                                            {option.label}
                                        </div>
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Second Season"
                                name="saisonSecond"
                                style={{ marginBottom: 16 }}
                            >
                                <Select
                                    options={seasonOptions}
                                    optionRender={(option) => (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ 
                                                width: 12, 
                                                height: 12, 
                                                borderRadius: '50%', 
                                                backgroundColor: option.data.color,
                                                marginRight: 8 
                                            }} />
                                            {option.label}
                                        </div>
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Third Season"
                                name="saisonThird"
                                style={{ marginBottom: 16 }}
                            >
                                <Select
                                    options={seasonOptions}
                                    optionRender={(option) => (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ 
                                                width: 12, 
                                                height: 12, 
                                                borderRadius: '50%', 
                                                backgroundColor: option.data.color,
                                                marginRight: 8 
                                            }} />
                                            {option.label}
                                        </div>
                                    )}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Number of Good Seasons"
                        name="numberGoodSaison"
                        rules={[{ required: true }]}
                        style={{ marginBottom: 16 }}
                    >
                        <InputNumber min={1} max={4} size="large" style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Divider style={{ marginTop: "0px", marginBottom: "24px" }} />

                {/* Sensor Parameters Section */}
                <div>
                    <Text type="secondary" style={{ fontSize: 14, marginBottom: 16, display: "block" }}>
                        <ExperimentOutlined /> Sensor Parameters
                    </Text>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="pH Ground"
                                name="phGroundSensor"
                                style={{ marginBottom: 16 }}
                            >
                                <InputNumber step={0.1} size="large" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="pH Min"
                                name="phMin"
                                style={{ marginBottom: 16 }}
                            >
                                <InputNumber step={0.1} size="large" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="pH Max"
                                name="phMax"
                                style={{ marginBottom: 16 }}
                            >
                                <InputNumber step={0.1} size="large" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Conductivity"
                                name="conductivityElectriqueFertilitySensor"
                                style={{ marginBottom: 16 }}
                            >
                                <InputNumber step={0.1} size="large" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Conductivity Min"
                                name="conductivityElectriqueFertilityMin"
                                style={{ marginBottom: 16 }}
                            >
                                <InputNumber step={0.1} size="large" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Conductivity Max"
                                name="conductivityElectriqueFertilityMax"
                                style={{ marginBottom: 16 }}
                            >
                                <InputNumber step={0.1} size="large" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Light"
                                name="lightSensor"
                                style={{ marginBottom: 16 }}
                            >
                                <InputNumber step={0.1} size="large" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Ground Temp"
                                name="temperatureSensorGround"
                                style={{ marginBottom: 16 }}
                            >
                                <InputNumber step={0.1} size="large" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="External Temp"
                                name="temperatureSensorExtern"
                                style={{ marginBottom: 16 }}
                            >
                                <InputNumber step={0.1} size="large" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Air Humidity"
                                name="humidityAirSensor"
                                style={{ marginBottom: 16 }}
                            >
                                <InputNumber step={0.1} size="large" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Ground Humidity"
                                name="humidityGroundSensor"
                                style={{ marginBottom: 16 }}
                            >
                                <InputNumber step={0.1} size="large" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Sun Exposure"
                                name="expositionTimeSun"
                                style={{ marginBottom: 16 }}
                            >
                                <InputNumber step={0.1} size="large" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                <Divider style={{ marginTop: "0px", marginBottom: "24px" }} />

                {/* Size and Care Section */}
                <div>
                    <Text type="secondary" style={{ fontSize: 14, marginBottom: 16, display: "block" }}>
                        <InfoCircleOutlined /> Size and Care
                    </Text>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Min Height (cm)"
                                name="heightMin"
                                style={{ marginBottom: 16 }}
                            >
                                <InputNumber min={0} size="large" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Max Height (cm)"
                                name="heightMax"
                                style={{ marginBottom: 16 }}
                            >
                                <InputNumber min={0} size="large" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Care Advice"
                        name="advise"
                        rules={[{ required: true }]}
                        style={{ marginBottom: 16 }}
                    >
                        <Input.TextArea rows={4} size="large" />
                    </Form.Item>
                </div>
            </Form>
        </Edit>
    );
} 