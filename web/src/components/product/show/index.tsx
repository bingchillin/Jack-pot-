import { DateField } from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Col, Row, Tag, Tooltip, message, Image } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, UserOutlined, ClockCircleOutlined, IdcardOutlined, DollarOutlined, ShoppingOutlined, BarcodeOutlined } from "@ant-design/icons";
import React from "react";
import { DetailRow } from "@/components/common/DetailRow";
import { showDetailsStyles } from "@/styles/show-details";
import { getHoverableProps } from "@/styles/common";

interface ProductDetailsProps {
  record: BaseRecord;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ record }) => {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <div style={showDetailsStyles.wrapper}>
        <DetailRow icon={<UserOutlined />} label="ID">
          {record.idProduct}
        </DetailRow>

        <DetailRow icon={<ShoppingOutlined />} label="Name">
          {record.name}
        </DetailRow>

        <DetailRow icon={<BarcodeOutlined />} label="SKU">
          {record.sku || '-'}
        </DetailRow>

        <DetailRow icon={<DollarOutlined />} label="Price">
          <Tag color="blue" style={{ margin: 0 }}>
            {typeof record.price === 'string' ? parseFloat(record.price).toFixed(2) : record.price?.toFixed(2)} €
          </Tag>
        </DetailRow>

        <DetailRow icon={<IdcardOutlined />} label="Description">
          {record.description || '-'}
        </DetailRow>

        <Row>
          <Col span={12}>
            <DetailRow icon={<ShoppingOutlined />} label="Stock Quantity">
              <Tag color="green" style={{ margin: 0 }}>
                {record.stockQuantity || 0}
              </Tag>
            </DetailRow>
          </Col>
          <Col span={12}>
            <DetailRow icon={<ClockCircleOutlined />} label="Reserved Quantity">
              <Tag color="orange" style={{ margin: 0 }}>
                {record.reservedQuantity || 0}
              </Tag>
            </DetailRow>
          </Col>
        </Row>

        <DetailRow icon={<CheckCircleOutlined />} label="Status">
          <Tag color={record.isActive ? "success" : "error"} icon={record.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
            {record.isActive ? "Active" : "Inactive"}
          </Tag>
        </DetailRow>

        {record.imageUrl && (
          <DetailRow icon={<IdcardOutlined />} label="Image">
            <img
              width={200}
              src={record.imageUrl}
              alt={record.name}
            />
          </DetailRow>
        )}

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