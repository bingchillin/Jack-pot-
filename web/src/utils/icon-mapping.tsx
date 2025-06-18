import React from "react";
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  IdcardOutlined, 
  TagsOutlined, 
  ToolOutlined,
  CloudOutlined,
  ExperimentOutlined,
  FireOutlined,
  EnvironmentOutlined,
  FieldTimeOutlined,
  StarOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  TeamOutlined,
  CalendarOutlined,
  BookOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  SolutionOutlined,
  BuildOutlined,
  ApartmentOutlined,
  GoldOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  CrownOutlined,
  FileTextOutlined,
  TagOutlined,
  BarsOutlined,
  RedoOutlined
} from "@ant-design/icons";

export const fieldIcons: { [key: string]: React.ReactNode } = {
  // General
  id: <IdcardOutlined />,
  title: <TagsOutlined />,
  description: <FileTextOutlined />,
  name: <TagsOutlined />,
  createdAt: <ClockCircleOutlined />,
  updatedAt: <ClockCircleOutlined />,
  date: <CalendarOutlined />,
  status: <CheckCircleOutlined />,
  action: <ToolOutlined />,
  actions: <ToolOutlined />,
  add: <PlusCircleOutlined />,
  search: <SearchOutlined />,
  
  // Object & Plant
  object: <ToolOutlined />,
  objectProfile: <SolutionOutlined />,
  plant: <GoldOutlined />,
  plantType: <BuildOutlined />,
  advice: <BookOutlined />,
  scientificName: <BookOutlined />,
  family: <TeamOutlined />,
  type: <TagOutlined />,
  parameter: <ToolOutlined />,
  parameterType: <ToolOutlined />,
  
  // Growing Conditions
  growingConditions: <EnvironmentOutlined />,
  exposition: <EnvironmentOutlined />,
  groundType: <EnvironmentOutlined />,
  plantationSeason: <FieldTimeOutlined />,
  growingSeasons: <FieldTimeOutlined />,
  sunExposure: <FieldTimeOutlined />,
  
  // Person & User
  person: <UserOutlined />,
  user: <UserOutlined />,
  email: <MailOutlined />,
  phone: <PhoneOutlined />,
  password: <LockOutlined />,
  role: <CrownOutlined />,
  team: <TeamOutlined />,
  firstName: <UserOutlined />,
  lastName: <UserOutlined />,
  fullName: <UserOutlined />,
  
  // Sensors
  humidity: <CloudOutlined />,
  humidityAir: <CloudOutlined />,
  humidityGround: <CloudOutlined />,
  temperature: <FireOutlined />,
  temperatureGround: <FireOutlined />,
  temperatureExtern: <FireOutlined />,
  ph: <ExperimentOutlined />,
  phGround: <ExperimentOutlined />,
  conductivity: <ExperimentOutlined />,
  light: <EnvironmentOutlined />,
  sensorParameters: <ExperimentOutlined />,
  
  // Size & Measurements
  sizeRange: <InfoCircleOutlined />,
  height: <InfoCircleOutlined />,
  min: <InfoCircleOutlined />,
  max: <InfoCircleOutlined />,
  
  // Status & State
  favorites: <StarOutlined />,
  automatic: <SettingOutlined />,
  willWatering: <SettingOutlined />,
  state: <SettingOutlined />,
  active: <CheckCircleOutlined />,
  inactive: <CloseCircleOutlined />,
  reset: <RedoOutlined />,
  preference: <BarsOutlined />,

  // Category
  category: <AppstoreOutlined />,
  categoryType: <ApartmentOutlined />,

  // Other
  default: <InfoCircleOutlined />,
};

export const getIcon = (fieldName: string): React.ReactNode => {
  const normalizedFieldName = fieldName.toLowerCase().replace(/ /g, '');
  for (const key in fieldIcons) {
    if (normalizedFieldName.includes(key)) {
      return fieldIcons[key];
    }
  }
  return fieldIcons.default;
}; 