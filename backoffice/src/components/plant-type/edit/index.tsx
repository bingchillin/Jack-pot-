import React from "react";
import { Modal, Form, Input, InputNumber, Space, Button } from "antd";
import { useForm } from "@refinedev/antd";
import { PlantType } from "../../../interfaces";

interface EditPlantTypeModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  record: PlantType;
}

export const EditPlantTypeModal: React.FC<EditPlantTypeModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  record,
}) => {
  const { formProps, saveButtonProps } = useForm({
    resource: "plant-types",
    id: record.id,
    action: "edit",
    onMutationSuccess: () => {
      onSuccess();
    },
  });

  return (
    <Modal
      title="Edit Plant Type"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Form {...formProps} layout="vertical" initialValues={record}>
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Scientific Name"
          name="scientist_name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Family Name"
          name="family_name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Type Name"
          name="type_name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="Exposition Type"
          name="exposition_type"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Ground Type"
          name="ground_type"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Plantation Season"
          name="plantation_saison"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Growing Seasons"
        >
          <Space>
            <Form.Item name="saison_first" noStyle>
              <Input placeholder="First Season" />
            </Form.Item>
            <Form.Item name="saison_second" noStyle>
              <Input placeholder="Second Season" />
            </Form.Item>
            <Form.Item name="saison_third" noStyle>
              <Input placeholder="Third Season" />
            </Form.Item>
            <Form.Item name="saison_last" noStyle>
              <Input placeholder="Last Season" />
            </Form.Item>
          </Space>
        </Form.Item>

        <Form.Item
          label="Number of Good Seasons"
          name="number_good_saison"
          rules={[{ required: true }]}
        >
          <InputNumber min={1} max={4} />
        </Form.Item>

        <Form.Item
          label="Sensor Parameters"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Form.Item label="pH Ground" name="ph_ground_sensor" noStyle>
                <InputNumber step={0.1} />
              </Form.Item>
              <Form.Item label="pH Min" name="ph_min" noStyle>
                <InputNumber step={0.1} />
              </Form.Item>
              <Form.Item label="pH Max" name="ph_max" noStyle>
                <InputNumber step={0.1} />
              </Form.Item>
            </Space>
            <Space>
              <Form.Item label="Conductivity" name="conductivity_electrique_fertility_sensor" noStyle>
                <InputNumber step={0.1} />
              </Form.Item>
              <Form.Item label="Conductivity Min" name="conductivity_electrique_fertility_min" noStyle>
                <InputNumber step={0.1} />
              </Form.Item>
              <Form.Item label="Conductivity Max" name="conductivity_electrique_fertility_max" noStyle>
                <InputNumber step={0.1} />
              </Form.Item>
            </Space>
            <Space>
              <Form.Item label="Light" name="light_sensor" noStyle>
                <InputNumber step={0.1} />
              </Form.Item>
              <Form.Item label="Ground Temp" name="temperature_sensor_ground" noStyle>
                <InputNumber step={0.1} />
              </Form.Item>
              <Form.Item label="External Temp" name="temperature_sensor_extern" noStyle>
                <InputNumber step={0.1} />
              </Form.Item>
            </Space>
            <Space>
              <Form.Item label="Air Humidity" name="humidity_air_sensor" noStyle>
                <InputNumber step={0.1} />
              </Form.Item>
              <Form.Item label="Ground Humidity" name="humidity_ground_sensor" noStyle>
                <InputNumber step={0.1} />
              </Form.Item>
              <Form.Item label="Sun Exposure" name="exposition_time_sun" noStyle>
                <InputNumber step={0.1} />
              </Form.Item>
            </Space>
          </Space>
        </Form.Item>

        <Form.Item
          label="Size Range (cm)"
        >
          <Space>
            <Form.Item name="height_min" noStyle>
              <InputNumber min={0} placeholder="Min Height" />
            </Form.Item>
            <Form.Item name="height_max" noStyle>
              <InputNumber min={0} placeholder="Max Height" />
            </Form.Item>
          </Space>
        </Form.Item>

        <Form.Item
          label="Care Advice"
          name="advise"
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" {...saveButtonProps}>
              Save
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}; 