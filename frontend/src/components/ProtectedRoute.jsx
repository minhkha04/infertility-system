import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Space, Typography, Divider, Modal } from 'antd';
import { UserOutlined, LoginOutlined, UserAddOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { path } from '../common/path';
import { clearAuth } from '../redux/authSlice';

const { Title, Paragraph } = Typography;

const ProtectedRoute = ({ children }) => {
  const token = useSelector((state) => state.authSlice.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Đồng bộ Redux token với localStorage
  useEffect(() => {
    const localToken = localStorage.getItem('token');
    if (!localToken && token) {
      dispatch(clearAuth());
    }
  }, [token, dispatch]);

  // Nếu đã đăng nhập, hiển thị component con
  if (token) {
    return children;
  }

  // Lưu URL hiện tại để chuyển hướng sau khi đăng nhập
  const handleLogin = () => {
    // Lưu URL hiện tại vào localStorage
    localStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    navigate(path.signIn);
  };

  const handleRegister = () => {
    // Lưu URL hiện tại vào localStorage
    localStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    navigate(path.signUp);
  };

  const handleClose = () => {
    // Chuyển về trang chủ khi bấm nút X
    navigate('/');
  };

  // Nếu chưa đăng nhập, hiển thị modal yêu cầu đăng nhập
  return (
    <>
      {/* Hiển thị nội dung trang phía sau với opacity thấp */}
      <div style={{ opacity: 0.3, pointerEvents: 'none' }}>
        {children}
      </div>
      
      {/* Modal overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <Card 
          className="shadow-lg text-center relative" 
          style={{ 
            backgroundColor: '#fff', 
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}
        >
          {/* Nút đóng */}
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 1,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              color: '#666'
            }}
          />

          <div className="mb-6">
            <UserOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={2} style={{ color: '#333', marginBottom: '8px' }}>
              🔒 Yêu cầu đăng nhập
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
              Để đăng ký dịch vụ điều trị, bạn cần đăng nhập vào hệ thống trước.
            </Paragraph>
          </div>

          <Divider />

          <div className="mb-6">
            <Title level={4} style={{ color: '#333', marginBottom: '16px' }}>
              🎯 Lợi ích khi đăng nhập:
            </Title>
            <div className="text-left space-y-3">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Đăng ký dịch vụ điều trị nhanh chóng</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Theo dõi tiến trình điều trị</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Xem lịch hẹn và kết quả khám</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Nhận thông báo và cập nhật từ bác sĩ</span>
              </div>
            </div>
          </div>

          <Divider />

          <Space size="large" className="w-full justify-center">
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              onClick={handleLogin}
              style={{
                height: '48px',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#1890ff',
                borderColor: '#1890ff'
              }}
            >
              Đăng nhập
            </Button>
            
            <Button
              size="large"
              icon={<UserAddOutlined />}
              onClick={handleRegister}
              style={{
                height: '48px',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderColor: '#1890ff',
                color: '#1890ff'
              }}
            >
              Đăng ký tài khoản
            </Button>
          </Space>

          <div className="mt-6">
            <Paragraph style={{ fontSize: '14px', color: '#999' }}>
              Chưa có tài khoản? <a href={path.signUp} style={{ color: '#1890ff' }}>Đăng ký ngay</a> để bắt đầu hành trình điều trị.
            </Paragraph>
          </div>
        </Card>
      </div>
    </>
  );
};

export default ProtectedRoute; 