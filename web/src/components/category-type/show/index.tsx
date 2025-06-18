import React from "react";
import { Typography, Tag } from "antd";
import { type BaseRecord } from "@refinedev/core";
import { DetailRow } from "@/components/common/DetailRow";
import { showDetailsStyles } from "@/styles/show-details";
import { getHoverableProps } from "@/styles/common";
import { getIcon } from "@/utils/icon-mapping";

const { Text } = Typography;

interface CategoryTypeDetailsProps {
  record: BaseRecord;
}

export const CategoryTypeDetails: React.FC<CategoryTypeDetailsProps> = ({ record }) => {
  return (
    <div style={showDetailsStyles.wrapper}>
      <DetailRow icon={getIcon("id")} label="ID">
        {record.idCategoryType}
      </DetailRow>

      <DetailRow icon={getIcon("title")} label="Title">
        {record.title}
      </DetailRow>

      <DetailRow icon={getIcon("description")} label="Description">
        {record.description}
      </DetailRow>

      <DetailRow icon={getIcon("createdAt")} label="Created At">
        <Tag color="success" style={{ margin: 0 }}>
          {new Date(record.createdAt).toLocaleString()}
        </Tag>
      </DetailRow>

      <DetailRow icon={getIcon("updatedAt")} label="Updated At">
        <Tag color="warning" style={{ margin: 0 }}>
          {new Date(record.updatedAt).toLocaleString()}
        </Tag>
      </DetailRow>
    </div>
  );
}; 