import React, { ReactNode } from 'react';
import { Typography } from 'antd';
import { showDetailsStyles } from '@/styles/show-details';

interface DetailRowProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}

export const DetailRow: React.FC<DetailRowProps> = ({ icon, label, children }) => {
  return (
    <div style={showDetailsStyles.container}>
      <div style={showDetailsStyles.icon}>{icon}</div>
      <div style={showDetailsStyles.content}>
        <Typography.Text type="secondary" style={showDetailsStyles.label}>
          {label}
        </Typography.Text>
        <div style={showDetailsStyles.data}>{children}</div>
      </div>
    </div>
  );
}; 