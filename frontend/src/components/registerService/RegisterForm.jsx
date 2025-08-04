import { Form, Input, Select, DatePicker, Radio, Button, Row, Col } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import DoctorScheduleModal from "./DoctorScheduleModal";
import { useLocation } from "react-router-dom";

export default function RegisterForm({
  form,
  doctors,
  services,
  loading,
  onSubmit,
  onDoctorChange,
  availableDoctors,
  setSelectedDate,
  setSelectedShift,
}) {
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const selectedServiceId = location.state?.selectedService;
  const selectedDoctorId = location.state?.selectedDoctor;

  const handleDoctorChange = (doctorId) => {
    form.setFieldsValue({ doctorId });
    onDoctorChange?.(doctorId);
  };

  // const selectedServiceName = location.state?.serviceName;
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      className="bg-white shadow-xl p-8 rounded-2xl"
    >
      {/* SECTION: Thông tin cá nhân */}
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-500">
        <UserOutlined />
        Thông tin Cá nhân
      </h3>
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            name="fullName"
            label="Họ và Tên"
            rules={[{ required: true }]}
          >
            <Input
              disabled
              placeholder="Nguyễn Văn A"
              prefix={<UserOutlined />}
              className="h-[48px] text-base"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input
              disabled
              placeholder="example@gmail.com"
              prefix={<MailOutlined />}
              className="h-[48px] text-base"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[{ required: true }]}
          >
            <Input
              disabled
              placeholder="0123456789"
              prefix={<PhoneOutlined />}
              className="h-[48px] text-base"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="dateOfBirth"
            label="Ngày sinh"
            rules={[{ required: true }]}
          >
            <DatePicker
              disabled
              className="w-full h-[48px] text-base"
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true }]}
          >
            <Radio.Group className="flex gap-6" disabled>
              <Radio value="female">Nữ</Radio>
              <Radio value="male">Nam</Radio>
              <Radio value="other">Khác</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true }]}
          >
            <Input
              disabled
              placeholder="Nhập địa chỉ của bạn"
              prefix={<HomeOutlined />}
              className="h-[48px] text-base"
            />
          </Form.Item>
        </Col>
      </Row>

      {/* SECTION: Thông tin đặt lịch */}
      <h3 className="text-lg font-bold mt-6 mb-4 flex items-center gap-2 text-orange-500">
        <CalendarOutlined />
        Thông tin Đặt lịch
      </h3>
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Xem lịch làm việc bác sĩ"
            colon={false}
            required={false}
          >
            <div className="ant-select ant-select-in-form-item w-full h-[48px]">
              <Button
                type="default"
                onClick={() => setShowModal(true)}
                icon={<CalendarOutlined />}
                className="w-full h-[46px] text-base font-medium border-orange-500 text-orange-500 hover:bg-orange-50"
                style={{
                  borderWidth: 1,
                  borderRadius: 6,
                  marginTop: -1, // điều chỉnh chính xác với Select của AntD
                }}
              >
                Xem lịch làm việc bác sĩ
              </Button>
            </div>
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="doctorId"
            label="Chọn bác sĩ"
            rules={[{ required: false }]}
            initialValue={selectedDoctorId}
          >
            <Select
              showSearch
              disabled={!!selectedDoctorId}
              placeholder="-- Chọn bác sĩ --"
              className="h-[48px] text-base"
              options={doctors.map((d) => ({
                label: `${d.fullName} - ${d.qualifications || "Chuyên khoa"}`,
                value: d.id,
              }))}
              onChange={handleDoctorChange}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="shift" label="Ca khám" rules={[{ required: true }]}>
            <Select
              placeholder="-- Chọn ca khám --"
              className="h-[48px] text-base"
              options={[
                { label: "Sáng (08:00 - 12:00)", value: "MORNING" },
                { label: "Chiều (13:00 - 17:00)", value: "AFTERNOON" },
              ]}
              // onChange={(shift) => {
              //   setSelectedShift(shift);
              //   form.setFieldsValue({ shift });
              // }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="cd1Date" label="Ngày đầu chu kỳ">
            <DatePicker
              className="w-full h-[48px] text-base"
              placeholder="(Tùy chọn)"
            />
          </Form.Item>
          <p className="text-sm text-gray-500 italic mt-1">
            Thông tin này giúp bác sĩ xác định chu kỳ kinh nguyệt và lập kế
            hoạch điều trị phù hợp
          </p>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="startDate"
            label="Ngày bắt đầu điều trị"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker
              className="w-full h-[48px] text-base"
              placeholder="Chọn ngày bắt đầu"
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="serviceId"
            label="Gói dịch vụ điều trị"
            rules={[{ required: true }]}
            initialValue={selectedServiceId}
          >
            <Select
              showSearch
              disabled={!!selectedServiceId}
              placeholder="-- Chọn dịch vụ --"
              className="h-[48px] text-base"
              options={services.map((s) => ({
                label: `${s.name} - ${s.price.toLocaleString()} ₫`,
                value: s.id,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ textAlign: "center", marginTop: 32 }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          className="px-10 rounded-lg"
          style={{ backgroundColor: "#f97316", borderColor: "#f97316" }}
        >
          Xác nhận đăng ký
        </Button>
      </Form.Item>

      <DoctorScheduleModal
        visible={showModal}
        selectedDoctorId={form.getFieldValue("doctorId")}
        onDoctorChange={(id) => {
          form.setFieldsValue({ doctorId: id });
          onDoctorChange?.(id);
        }}
        onClose={() => setShowModal(false)}
        onSelect={({ doctorId, startDate, shift }) => {
          form.setFieldsValue({ doctorId, startDate, shift });
          onDoctorChange?.(doctorId);
          setShowModal(false);
        }}
      />
    </Form>
  );
}
