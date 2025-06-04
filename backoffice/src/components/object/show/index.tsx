import { DateField } from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Tag, message, Tooltip } from "antd";
import { UserOutlined, ClockCircleOutlined, IdcardOutlined, TagsOutlined, FileTextOutlined } from "@ant-design/icons";
import React from "react";
import { DetailRow } from "@/components/common/DetailRow";
import { showDetailsStyles } from "@/styles/show-details";
import { GiPlantWatering } from "react-icons/gi";
import { CiTextAlignCenter } from "react-icons/ci";
import { MdNumbers } from "react-icons/md";
import { getHoverableProps } from "@/styles/common";

interface ObjectDetailsProps {
  record: BaseRecord;
}

export const ObjectDetails: React.FC<ObjectDetailsProps> = ({ record }) => {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <div style={showDetailsStyles.wrapper}>
        <DetailRow icon={<IdcardOutlined />} label="ID">
          {record.idObject}
        </DetailRow>

        <DetailRow icon={<TagsOutlined />} label="Category Type">
          <Tooltip title={`Category Type ID: ${record.categoryType?.idCategoryType || 'N/A'}`}>
            <span {...getHoverableProps()}>{record.categoryType?.title || '-'}</span>
          </Tooltip>
        </DetailRow>

        <DetailRow icon={<UserOutlined />} label="Person">
          <Tooltip title={`Person ID: ${record.person?.idPerson || 'N/A'}`}>
            <span {...getHoverableProps()}>{record.person?.email || '-'}</span>
          </Tooltip>
        </DetailRow>

        <DetailRow icon={<GiPlantWatering />} label="Title">
          {record.title}
        </DetailRow>

        <DetailRow icon={<FileTextOutlined />} label="Description">
          {record.description}
        </DetailRow>

        <DetailRow icon={<CiTextAlignCenter />} label="Advice">
          {record.advise}
        </DetailRow>

        <DetailRow icon={<MdNumbers />} label="Preference Number">
          {record.preference_number ?? '-'}
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