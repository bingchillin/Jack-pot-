import { 
  CrownOutlined, 
  UserOutlined, 
  TeamOutlined, 
  SafetyCertificateOutlined, 
  ShopOutlined,
  ExperimentOutlined,
  GlobalOutlined,
  RocketOutlined,
  StarOutlined,
  ToolOutlined
} from '@ant-design/icons';
import React from 'react';

export interface RoleIcon {
  icon: React.ReactNode;
  color: string;
}

export const ROLE_ICONS: Record<string, RoleIcon> = {
  admin: {
    icon: React.createElement(CrownOutlined),
    color: '#faad14'
  },
  user: {
    icon: React.createElement(UserOutlined),
    color: '#1890ff'
  },
  manager: {
    icon: React.createElement(TeamOutlined),
    color: '#52c41a'
  },
  moderator: {
    icon: React.createElement(SafetyCertificateOutlined),
    color: '#1890ff'
  },
  seller: {
    icon: React.createElement(ShopOutlined),
    color: '#722ed1'
  },
  scientist: {
    icon: React.createElement(ExperimentOutlined),
    color: '#13c2c2'
  },
  explorer: {
    icon: React.createElement(GlobalOutlined),
    color: '#eb2f96'
  },
  innovator: {
    icon: React.createElement(RocketOutlined),
    color: '#f5222d'
  },
  expert: {
    icon: React.createElement(StarOutlined),
    color: '#fa8c16'
  },
  technician: {
    icon: React.createElement(ToolOutlined),
    color: '#2f54eb'
  }
};

export const ROLE_OPTIONS = Object.keys(ROLE_ICONS).map(key => ({
  label: key.charAt(0).toUpperCase() + key.slice(1),
  value: key,
  icon: ROLE_ICONS[key].icon
})); 