import React, { useState, useEffect } from 'react';
import { 
  Card, Form, Input, Button, DatePicker, Select, 
  message, Spin, Row, Col, Typography 
} from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { authService } from '../../service/auth.service';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const { Title } = Typography;
const { Option } = Select;

const UpdateProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const authState = useSelector((state) => state.authSlice);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await authService.getMyInfo();
      console.log('User Info Response:', response);
      
      if (response?.data?.result) {
        const userData = response.data.result;
        setUserInfo(userData);
        form.setFieldsValue({
          fullName: userData.fullName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          dateOfBirth: userData.dateOfBirth ? dayjs(userData.dateOfBirth) : null,
          gender: userData.gender,
          address: userData.address
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      message.error('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    if (!userInfo?.id) {
      message.error('Không thể lấy thông tin người dùng');
      return;
    }

    console.log('Auth State:', authState);
    console.log('User Info:', userInfo);
    console.log('Form Values:', values);

    try {
      setSubmitting(true);
      const response = await authService.updateUser(
        userInfo.id, 
        {
          ...values,
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null
        }, 
        authState.token
      );

      console.log('Update Response:', response);

      if (response?.data?.code === 1000) {
        message.success('Cập nhật thông tin thành công');
        // Chuyển hướng về trang profile sau khi cập nhật thành công
        setTimeout(() => {
          navigate('/customer-dashboard/profile');
        }, 1500);
      } else {
        message.error(response?.data?.message || 'Cập nhật thông tin thất bại');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/customer-dashboard/profile');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>Cập nhật thông tin cá nhân</Title>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            gender: 'male'
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Nhập email" disabled />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
                rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
              >
                <Input prefix={<EnvironmentOutlined />} placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              style={{ marginRight: 8 }}
            >
              Cập nhật
            </Button>
            <Button onClick={handleCancel}>
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateProfile; 