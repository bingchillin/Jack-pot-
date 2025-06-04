import { DateField } from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Col, Row, Tag, Tooltip, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, UserOutlined, ClockCircleOutlined, IdcardOutlined } from "@ant-design/icons";
import React from "react";
import { DetailRow } from "@/components/common/DetailRow";
import { showDetailsStyles } from "@/styles/show-details";
import { GiPlantWatering } from "react-icons/gi";
import { CiTextAlignCenter } from "react-icons/ci";
import { MdEuro, MdOutlineEventAvailable } from "react-icons/md";
import { TbCategory } from "react-icons/tb";
import { getHoverableProps } from "@/styles/common";

interface PlantDetailsProps {
  record: BaseRecord;
}

export const PlantDetails: React.FC<PlantDetailsProps> = ({ record }) => {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <div style={showDetailsStyles.wrapper}>
        <DetailRow icon={<UserOutlined />} label="ID">
          {record.idPlant}
        </DetailRow>

        <DetailRow icon={<GiPlantWatering />} label="Name">
          {record.name}
        </DetailRow>

        <DetailRow icon={<TbCategory />} label="Category">
          {record.category}
        </DetailRow>

        <DetailRow icon={<MdEuro />} label="Price">
          {record.price} €
        </DetailRow>

        <DetailRow icon={<CiTextAlignCenter />} label="Description">
          {record.description || '-'}
        </DetailRow>

        <DetailRow icon={<MdOutlineEventAvailable />} label="Is Available">
          <Tag color={record.isAvailable ? "success" : "error"} icon={record.isAvailable ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
            {record.isAvailable ? "Yes" : "No"}
          </Tag>
        </DetailRow>

        <Row>
          <Col span={12}>
            <DetailRow icon={<IdcardOutlined />} label="Object">
              <Tooltip title={`Object ID: ${record.object?.idObject || 'N/A'}`}>
                <span {...getHoverableProps()}>
                  {record.object?.title || '-'}
                </span>
              </Tooltip>
            </DetailRow>
          </Col>
          <Col span={12}>
            <DetailRow icon={<UserOutlined />} label="Person">
              <Tooltip title={`Person ID: ${record.person?.idPerson || 'N/A'}`}>
                <span {...getHoverableProps()}>
                  {record.person?.email || '-'}
                </span>
              </Tooltip>
            </DetailRow>
          </Col>
        </Row>
          

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