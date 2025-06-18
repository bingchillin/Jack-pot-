import React from "react";
import { Typography, Tag, Space } from "antd";
import { type BaseRecord } from "@refinedev/core";
import {
  EnvironmentOutlined,
  FieldTimeOutlined,
  FireOutlined,
  CloudOutlined,
  ExperimentOutlined,
  InfoCircleOutlined,
  BookOutlined,
  TeamOutlined,
  TagOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { DetailRow } from "@/components/common/DetailRow";
import { showDetailsStyles } from "@/styles/show-details";
import { seasonColors } from "@/utils/api/enum";
const { Text } = Typography;

interface PlantTypeDetailsProps {
  record: BaseRecord;
}

export const PlantTypeDetails: React.FC<PlantTypeDetailsProps> = ({ record }) => {
  const getSeasonTag = (season: string) => {
    return <Tag color={seasonColors[season as keyof typeof seasonColors]}>{season}</Tag>;
  };

  return (
    <div style={showDetailsStyles.wrapper}>
      <DetailRow icon={<BookOutlined />} label="Title">
        {record.title}
      </DetailRow>

      <DetailRow icon={<BookOutlined />} label="Scientific Name">
        <Text italic>{record.scientistName}</Text>
      </DetailRow>

      <DetailRow icon={<TeamOutlined />} label="Family">
        {record.familyName}
      </DetailRow>

      <DetailRow icon={<TagOutlined />} label="Type">
        {record.typeName}
      </DetailRow>

      <DetailRow icon={<FileTextOutlined />} label="Description">
        {record.description}
      </DetailRow>

      <DetailRow icon={<EnvironmentOutlined />} label="Growing Conditions">
        <Space direction="vertical" size="small">
          <Space>
            <EnvironmentOutlined />
            <Text>Exposition: {record.expositionType}</Text>
          </Space>
          <Space>
            <EnvironmentOutlined />
            <Text>Ground Type: {record.groundType}</Text>
          </Space>
          <Space>
            <FieldTimeOutlined />
            <Text>Plantation Season: {record.plantationSaison}</Text>
          </Space>
        </Space>
      </DetailRow>

      <DetailRow icon={<FieldTimeOutlined />} label="Growing Seasons">
        <Space wrap>
          {record.saisonFirst && getSeasonTag(record.saisonFirst)}
          {record.saisonSecond && getSeasonTag(record.saisonSecond)}
          {record.saisonThird && getSeasonTag(record.saisonThird)}
        </Space>
      </DetailRow>

      <DetailRow icon={<ExperimentOutlined />} label="Sensor Parameters">
        <Space direction="vertical" size="small">
          <Space>
            <FireOutlined />
            <Text>Temperature (Ground): {record.temperatureSensorGround}°C</Text>
          </Space>
          <Space>
            <FireOutlined />
            <Text>Temperature (External): {record.temperatureSensorExtern}°C</Text>
          </Space>
          <Space>
            <CloudOutlined />
            <Text>Air Humidity: {record.humidityAirSensor}%</Text>
          </Space>
          <Space>
            <CloudOutlined />
            <Text>Ground Humidity: {record.humidityGroundSensor}%</Text>
          </Space>
          <Space>
            <ExperimentOutlined />
            <Text>pH Level: {record.phGroundSensor}</Text>
          </Space>
          <Space>
            <ExperimentOutlined />
            <Text>Conductivity: {record.conductivityElectriqueFertilitySensor}</Text>
          </Space>
          <Space>
            <FieldTimeOutlined />
            <Text>Sun Exposure: {record.expositionTimeSun} hours</Text>
          </Space>
        </Space>
      </DetailRow>

      <DetailRow icon={<InfoCircleOutlined />} label="Size Range">
        <Space>
          <Text>Min: {record.heightMin}cm</Text>
          <Text>-</Text>
          <Text>Max: {record.heightMax}cm</Text>
        </Space>
      </DetailRow>

      <DetailRow icon={<InfoCircleOutlined />} label="Care Advice">
        {record.advise}
      </DetailRow>
    </div>
  );
}; 