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
  ClockCircleOutlined
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
        <Text italic>{record.scientist_name}</Text>
      </DetailRow>

      <DetailRow icon={<TeamOutlined />} label="Family">
        {record.family_name}
      </DetailRow>

      <DetailRow icon={<TagOutlined />} label="Type">
        {record.type_name}
      </DetailRow>

      <DetailRow icon={<FileTextOutlined />} label="Description">
        {record.description}
      </DetailRow>

      <DetailRow icon={<EnvironmentOutlined />} label="Growing Conditions">
        <Space direction="vertical" size="small">
          <Space>
            <EnvironmentOutlined />
            <Text>Exposition: {record.exposition_type}</Text>
          </Space>
          <Space>
            <EnvironmentOutlined />
            <Text>Ground Type: {record.ground_type}</Text>
          </Space>
          <Space>
            <FieldTimeOutlined />
            <Text>Plantation Season: {record.plantation_saison}</Text>
          </Space>
        </Space>
      </DetailRow>

      <DetailRow icon={<FieldTimeOutlined />} label="Growing Seasons">
        <Space wrap>
          {record.saison_first && getSeasonTag(record.saison_first)}
          {record.saison_second && getSeasonTag(record.saison_second)}
          {record.saison_third && getSeasonTag(record.saison_third)}
        </Space>
      </DetailRow>

      <DetailRow icon={<ExperimentOutlined />} label="Sensor Parameters">
        <Space direction="vertical" size="small">
          <Space>
            <FireOutlined />
            <Text>Temperature (Ground): {record.temperature_sensor_ground}°C</Text>
          </Space>
          <Space>
            <FireOutlined />
            <Text>Temperature (External): {record.temperature_sensor_extern}°C</Text>
          </Space>
          <Space>
            <CloudOutlined />
            <Text>Air Humidity: {record.humidity_air_sensor}%</Text>
          </Space>
          <Space>
            <CloudOutlined />
            <Text>Ground Humidity: {record.humidity_ground_sensor}%</Text>
          </Space>
          <Space>
            <ExperimentOutlined />
            <Text>pH Level: {record.ph_ground_sensor}</Text>
          </Space>
          <Space>
            <ExperimentOutlined />
            <Text>Conductivity: {record.conductivity_electrique_fertility_sensor}</Text>
          </Space>
          <Space>
            <FieldTimeOutlined />
            <Text>Sun Exposure: {record.exposition_time_sun} hours</Text>
          </Space>
        </Space>
      </DetailRow>

      <DetailRow icon={<InfoCircleOutlined />} label="Size Range">
        <Space>
          <Text>Min: {record.height_min}cm</Text>
          <Text>-</Text>
          <Text>Max: {record.height_max}cm</Text>
        </Space>
      </DetailRow>

      <DetailRow icon={<InfoCircleOutlined />} label="Care Advice">
        {record.advise}
      </DetailRow>
    </div>
  );
}; 