import React from "react";
import { Typography, Descriptions, Tag, Space } from "antd";
import { type BaseRecord } from "@refinedev/core";
import { 
  EnvironmentOutlined, 
  FieldTimeOutlined, 
  FireOutlined,
  CloudOutlined,
  ExperimentOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface PlantTypeDetailsProps {
  record: BaseRecord;
}

export const PlantTypeDetails: React.FC<PlantTypeDetailsProps> = ({ record }) => {
  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>{record.title}</Title>
      
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Scientific Name">
          <Text italic>{record.scientist_name}</Text>
        </Descriptions.Item>
        
        <Descriptions.Item label="Family">
          {record.family_name}
        </Descriptions.Item>
        
        <Descriptions.Item label="Type">
          {record.type_name}
        </Descriptions.Item>

        <Descriptions.Item label="Description">
          {record.description}
        </Descriptions.Item>

        <Descriptions.Item label="Growing Conditions">
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
        </Descriptions.Item>

        <Descriptions.Item label="Growing Seasons">
          <Space wrap>
            {record.saison_first && <Tag color="green">{record.saison_first}</Tag>}
            {record.saison_second && <Tag color="green">{record.saison_second}</Tag>}
            {record.saison_third && <Tag color="green">{record.saison_third}</Tag>}
            {record.saison_last && <Tag color="green">{record.saison_last}</Tag>}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="Sensor Parameters">
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
        </Descriptions.Item>

        <Descriptions.Item label="Size Range">
          <Space>
            <Text>Min: {record.height_min}cm</Text>
            <Text>-</Text>
            <Text>Max: {record.height_max}cm</Text>
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="Care Advice">
          <Space>
            <InfoCircleOutlined />
            <Text>{record.advise}</Text>
          </Space>
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}; 