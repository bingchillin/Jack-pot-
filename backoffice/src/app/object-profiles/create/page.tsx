"use client";

import { useForm, Create, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Row, Col, Typography, Divider, Card, Switch, InputNumber } from "antd";
import React from "react";

const { Text } = Typography;

export default function ObjectprofileCreate() {
  const { formProps, saveButtonProps } = useForm({
    resource: "object-profiles",
    action: "create",
  });

  const { selectProps: objectSelectProps } = useSelect({
    resource: "objects",
    optionLabel: "title",
    optionValue: "idObject"
  });

  const { selectProps: plantTypeSelectProps } = useSelect({
    resource: "plant-types",
    optionLabel: "title",
    optionValue: "idPlantType",
  });

  const { selectProps: personSelectProps } = useSelect({
    resource: "person",
    optionLabel: "email",
    optionValue: "idPerson",
  });

  return (
    <Create
      saveButtonProps={saveButtonProps}
    >
      <Form {...formProps} layout="vertical">
        <Card>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: "Title is required" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: "Description is required" }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Object"
                name={["object", "idObject"]}
                rules={[{ required: true, message: "Object is required" }]}
              >
                <Select
                  placeholder="Select an object"
                  {...objectSelectProps}
                  options={objectSelectProps.options?.map((option: any) => ({
                    value: option.value,
                    label: option.data?.title || option.label || 'Untitled Object',
                    data: option.data
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Plant Type"
                name={["plantType", "idPlantType"]}
                rules={[{ required: true, message: "Plant Type is required" }]}
              >
                <Select
                  placeholder="Select a plant type"
                  {...plantTypeSelectProps}
                  options={plantTypeSelectProps.options?.map((option: any) => ({
                    value: option.value,
                    label: option.data?.title || option.label || 'Untitled Plant Type',
                    data: option.data
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Person"
                name={["person", "idPerson"]}
                rules={[{ required: true, message: "Person is required" }]}
              >
                <Select
                  placeholder="Select a person"
                  {...personSelectProps}
                  options={personSelectProps.options?.map((option: any) => ({
                    value: option.value,
                    label: option.data?.email || option.label || 'No email',
                    data: option.data
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Advice"
                name="advise"
                rules={[{ required: true, message: "Advice is required" }]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Sensor Data</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Air Humidity (%)"
                name="humidityAirSensor"
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ground Humidity (%)"
                name="humidityGroundSensor"
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="pH Level"
                name="phGroundSensor"
              >
                <InputNumber min={0} max={14} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Conductivity"
                name="conductivityElectriqueFertilitySensor"
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ground Temperature (°C)"
                name="temperatureSensorGround"
              >
                <InputNumber min={-50} max={100} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="External Temperature (°C)"
                name="temperatureSensorExtern"
              >
                <InputNumber min={-50} max={100} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Light Sensor"
                name="lightSensor"
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Sun Exposure (hours)"
                name="expositionTimeSun"
              >
                <InputNumber min={0} max={24} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Status</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Favorites"
                name="favoris"
                initialValue={0}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Automatic"
                name="isAutomatic"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Will Watering"
                name="isWillWatering"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="State"
                name="state"
                initialValue={0}
              >
                <Select>
                  <Select.Option value={0}>Default</Select.Option>
                  <Select.Option value={1}>Active</Select.Option>
                  <Select.Option value={2}>Warning</Select.Option>
                  <Select.Option value={3}>Error</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Create>
  );
} 