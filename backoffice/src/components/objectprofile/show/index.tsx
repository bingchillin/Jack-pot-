import { DateField } from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Tag, message, Tooltip } from "antd";
import { ClockCircleOutlined, IdcardOutlined, TagsOutlined, ToolOutlined } from "@ant-design/icons";
import React from "react";
import { DetailRow } from "@/components/common/DetailRow";
import { showDetailsStyles } from "@/styles/show-details";
import { getHoverableProps } from "@styles/common";
import { CiTextAlignCenter } from "react-icons/ci";

interface ObjectProfileDetailsProps {
  record: BaseRecord;
}

export const ObjectProfileDetails: React.FC<ObjectProfileDetailsProps> = ({ record }) => {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <div style={showDetailsStyles.wrapper}>
        <DetailRow icon={<IdcardOutlined />} label="ID">
          {record.idObjectProfile}
        </DetailRow>

        <DetailRow icon={<ToolOutlined />} label="Object">
          <Tooltip title={`Object ID: ${record.object?.idObject || 'N/A'}`}>
            <span {...getHoverableProps()}>{record.object?.title || '-'}</span>
          </Tooltip>
        </DetailRow>

        <DetailRow icon={<TagsOutlined />} label="Plant Type">
          <Tooltip title={`Plant Type ID: ${record.plantType?.idPlantType || 'N/A'}`}>
            <span {...getHoverableProps()}>{record.plantType?.title || '-'}</span>
          </Tooltip>
        </DetailRow>

        <DetailRow icon={<CiTextAlignCenter />} label="Advice">
          {record.advise}
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