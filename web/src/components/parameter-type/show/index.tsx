import { DateField } from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Tag, message, Tooltip } from "antd";
import { ClockCircleOutlined, IdcardOutlined, TagsOutlined, ToolOutlined } from "@ant-design/icons";
import React from "react";
import { DetailRow } from "@/components/common/DetailRow";
import { showDetailsStyles } from "@/styles/show-details";
import { getHoverableProps } from "@styles/common";
import { CiTextAlignCenter } from "react-icons/ci";

interface ParameterTypeDetailsProps {
  record: BaseRecord;
}

export const ParameterTypeDetails: React.FC<ParameterTypeDetailsProps> = ({ record }) => {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <div style={showDetailsStyles.wrapper}>
        <DetailRow icon={<IdcardOutlined />} label="ID">
          {record.idParameterType}
        </DetailRow>

        <DetailRow icon={<ToolOutlined />} label="Person Parameter Type">
          <Tooltip title={`Person Parameter Type ID: ${record.personParameterType?.idPersonParameterType || 'N/A'}`}>
            <span {...getHoverableProps()}>{record.personParameterType?.title || '-'}</span>
          </Tooltip>
        </DetailRow>

        <DetailRow icon={<CiTextAlignCenter />} label="Description">
          {record.description}
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