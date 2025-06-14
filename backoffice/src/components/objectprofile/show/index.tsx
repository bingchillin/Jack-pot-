import { useShow } from "@refinedev/core";
import { Show, DateField } from "@refinedev/antd";
import { Typography, Tooltip, Tag, Space, Row, Col } from "antd";
import { 
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import React from "react";
import { DetailRow } from "@/components/common/DetailRow";
import { showDetailsStyles } from "@/styles/show-details";
import { getHoverableProps } from "@/styles/common";
import { getIcon } from "@/utils/icon-mapping";
import type { BaseRecord } from "@refinedev/core";

interface ObjectProfileDetailsProps {
  record: BaseRecord;
}

export const ObjectProfileDetails: React.FC<ObjectProfileDetailsProps> = ({ record }) => {
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

  return (
    <div style={showDetailsStyles.wrapper}>
      <DetailRow icon={getIcon("id")} label="ID">
        {record?.idObjectProfile}
      </DetailRow>

      <DetailRow icon={getIcon("title")} label="Title">
        {record?.title || '-'}
      </DetailRow>

      <DetailRow icon={getIcon("description")} label="Description">
        {record?.description || '-'}
      </DetailRow>

      <DetailRow icon={getIcon("object")} label="Object">
        <Tooltip title={`Object ID: ${record?.object?.idObject || 'N/A'}`}>
          <span {...getHoverableProps()}>{record?.object?.title || '-'}</span>
        </Tooltip>
      </DetailRow>

      <DetailRow icon={getIcon("plantType")} label="Plant Type">
        <Tooltip title={`Plant Type ID: ${record?.plantType?.idPlantType || 'N/A'}`}>
          <span {...getHoverableProps()}>{record?.plantType?.title || '-'}</span>
        </Tooltip>
      </DetailRow>

      <DetailRow icon={getIcon("person")} label="Person">
        <Tooltip title={`Person ID: ${record?.person?.idPerson || 'N/A'}`}>
          <span {...getHoverableProps()}>
            {record?.person?.email || '-'}
          </span>
        </Tooltip>
      </DetailRow>

      <DetailRow icon={getIcon("advice")} label="Advice">
        {record?.advise || '-'}
      </DetailRow>

      <Row gutter={16}>
        <Col span={12}>
          <DetailRow icon={getIcon("humidityAir")} label="Air Humidity">
            {record?.humidityAirSensor ? `${record.humidityAirSensor}%` : '-'}
          </DetailRow>
        </Col>
        <Col span={12}>
          <DetailRow icon={getIcon("humidityGround")} label="Ground Humidity">
            {record?.humidityGroundSensor ? `${record.humidityGroundSensor}%` : '-'}
          </DetailRow>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <DetailRow icon={getIcon("phGround")} label="pH Level">
            {record?.phGroundSensor || '-'}
          </DetailRow>
        </Col>
        <Col span={12}>
          <DetailRow icon={getIcon("conductivity")} label="Conductivity">
            {record?.conductivityElectriqueFertilitySensor || '-'}
          </DetailRow>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <DetailRow icon={getIcon("temperatureGround")} label="Ground Temperature">
            {record?.temperatureSensorGround ? `${record.temperatureSensorGround}°C` : '-'}
          </DetailRow>
        </Col>
        <Col span={12}>
          <DetailRow icon={getIcon("temperatureExtern")} label="External Temperature">
            {record?.temperatureSensorExtern ? `${record.temperatureSensorExtern}°C` : '-'}
          </DetailRow>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <DetailRow icon={getIcon("light")} label="Light Sensor">
            {record?.lightSensor || '-'}
          </DetailRow>
        </Col>
        <Col span={12}>
          <DetailRow icon={getIcon("sunExposure")} label="Sun Exposure">
            {record?.expositionTimeSun ? `${record.expositionTimeSun} hours` : '-'}
          </DetailRow>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <DetailRow icon={getIcon("favorites")} label="Favorites">
            {record?.favoris || '0'}
          </DetailRow>
        </Col>
        <Col span={8}>
          <DetailRow icon={getIcon("automatic")} label="Automatic">
            <Tag color={record?.isAutomatic ? "success" : "default"} icon={record?.isAutomatic ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
              {record?.isAutomatic ? "Yes" : "No"}
            </Tag>
          </DetailRow>
        </Col>
        <Col span={8}>
          <DetailRow icon={getIcon("willWatering")} label="Will Watering">
            <Tag color={record?.isWillWatering ? "success" : "default"} icon={record?.isWillWatering ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
              {record?.isWillWatering ? "Yes" : "No"}
            </Tag>
          </DetailRow>
        </Col>
      </Row>

      <DetailRow icon={getIcon("state")} label="State">
        {getStateTag(record?.state || 0)}
      </DetailRow>

      <DetailRow icon={getIcon("createdAt")} label="Created At">
        <Tag color="success" style={{ margin: 0 }}>
          {record?.createdAt ? new Date(record.createdAt).toLocaleString() : '-'}
        </Tag>
      </DetailRow>

      <DetailRow icon={getIcon("updatedAt")} label="Updated At">
        <Tag color="warning" style={{ margin: 0 }}>
          {record?.updatedAt ? new Date(record.updatedAt).toLocaleString() : '-'}
        </Tag>
      </DetailRow>
    </div>
  );
};

export default function ObjectProfileShow() {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      {record && <ObjectProfileDetails record={record} />}
    </Show>
  );
} 