import { DateField } from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { message, Tag } from "antd";
import { ClockCircleOutlined, AppstoreOutlined, TagsOutlined, InfoCircleOutlined } from "@ant-design/icons";
import React from "react";
import { DetailRow } from "@/components/common/DetailRow";
import { showDetailsStyles } from "@/styles/show-details";

interface CategoryTypeDetailsProps {
  record: BaseRecord;
}

export const CategoryTypeDetails: React.FC<CategoryTypeDetailsProps> = ({ record }) => {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <div style={showDetailsStyles.wrapper}>
        <DetailRow icon={<AppstoreOutlined />} label="ID">
          {record.idCategoryType}
        </DetailRow>

        <DetailRow icon={<TagsOutlined />} label="Title">
          {record.title}
        </DetailRow>

        <DetailRow icon={<InfoCircleOutlined />} label="Description">
          {record.description}
        </DetailRow>

        <DetailRow icon={<ClockCircleOutlined />} label="Created At">
          <Tag color="success" style={{ margin: 0 }}>
            <DateField value={record.createdAt} format="DD/MM/YYYY HH:mm" />
          </Tag>
        </DetailRow>

        <DetailRow icon={<ClockCircleOutlined />} label="Updated At">
          <Tag color="warning" style={{ margin: 0 }}>
            <DateField value={record.updatedAt} format="DD/MM/YYYY HH:mm" />
          </Tag>
        </DetailRow>
      </div>
    </>
  );
}; 