import React, { useState } from "react";
import { 
  List, Card, Badge, Button, Tag, Typography, 
  Empty, Tabs, Space, Dropdown, Menu, Modal
} from "antd";
import {
  BellOutlined, CalendarOutlined, MedicineBoxOutlined,
  FileTextOutlined, ReadOutlined, HeartOutlined,
  MailOutlined, ClockCircleOutlined, EllipsisOutlined,
  ExclamationCircleOutlined, CheckCircleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const Notifications = () => {
  const [readVisible, setReadVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  // Mock data for notifications
  const notifications = [
    {
      id: 1,
      title: "Nhắc nhở lịch hẹn",
      content: "Bạn có lịch hẹn siêu âm theo dõi vào ngày mai (22/01/2024) lúc 09:30 với BS. Nguyễn Văn A tại Phòng 105, Tầng 1.",
      type: "appointment",
      time: "2024-01-21T14:30:00",
      read: false,
      priority: "high",
      relatedId: "APT003"
    },
    {
      id: 2,
      title: "Kết quả xét nghiệm hormone",
      content: "Kết quả xét nghiệm hormone của bạn đã có. Tất cả các chỉ số đều trong ngưỡng bình thường.",
      type: "test_result",
      time: "2024-01-20T10:15:00",
      read: true,
      priority: "normal",
      relatedId: "TST001"
    },
    {
      id: 3,
      title: "Hướng dẫn chuẩn bị cho thủ thuật",
      content: "Vui lòng xem hướng dẫn chuẩn bị cho thủ thuật lấy trứng dự kiến vào ngày 30/01/2024. Bạn cần nhịn ăn từ 22:00 tối hôm trước và có người thân đi cùng.",
      type: "instruction",
      time: "2024-01-19T16:45:00",
      read: false,
      priority: "high",
      relatedId: "INS002"
    },
    {
      id: 4,
      title: "Thanh toán đợt 2",
      content: "Đã đến hạn thanh toán đợt 2 cho gói điều trị IVF Tiêu chuẩn. Vui lòng thanh toán trước ngày 25/01/2024.",
      type: "payment",
      time: "2024-01-18T09:20:00",
      read: true,
      priority: "high",
      relatedId: "PAY002"
    },
    {
      id: 5,
      title: "Cập nhật lịch trình điều trị",
      content: "Lịch trình điều trị của bạn đã được cập nhật. Vui lòng kiểm tra mục Tiến trình điều trị để biết thêm chi tiết.",
      type: "treatment",
      time: "2024-01-17T14:00:00",
      read: true,
      priority: "normal",
      relatedId: "TRT001"
    },
    {
      id: 6,
      title: "Đánh giá dịch vụ",
      content: "Cảm ơn bạn đã sử dụng dịch vụ Tư vấn Ban đầu. Vui lòng dành một chút thời gian để đánh giá trải nghiệm của bạn.",
      type: "review",
      time: "2024-01-16T13:30:00",
      read: true,
      priority: "low",
      relatedId: "SV001"
    },
    {
      id: 7,
      title: "Bài viết mới về IVF",
      content: "Chúng tôi vừa đăng tải bài viết mới về 'Các yếu tố ảnh hưởng đến thành công của IVF'. Bạn có thể tham khảo tại mục Blog.",
      type: "blog",
      time: "2024-01-15T10:00:00",
      read: true,
      priority: "low",
      relatedId: "BLG015"
    }
  ];

  // Filter notifications
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);
  
  // Icon map based on notification type
  const getNotificationIcon = (type, priority) => {
    const iconMap = {
      appointment: <CalendarOutlined style={{ color: '#1890ff' }} />,
      test_result: <FileTextOutlined style={{ color: '#52c41a' }} />,
      instruction: <ReadOutlined style={{ color: '#722ed1' }} />,
      payment: <MedicineBoxOutlined style={{ color: '#fa8c16' }} />,
      treatment: <HeartOutlined style={{ color: '#eb2f96' }} />,
      review: <MailOutlined style={{ color: '#faad14' }} />,
      blog: <ReadOutlined style={{ color: '#13c2c2' }} />
    };
    
    return (
      <Badge 
        dot={priority === "high" && !readVisible} 
        color="red" 
        offset={[-5, 5]}
      >
        {iconMap[type] || <BellOutlined />}
      </Badge>
    );
  };
  
  // Get tag for notification type
  const getNotificationTypeTag = (type) => {
    const typeMap = {
      appointment: { color: 'blue', text: 'Lịch hẹn' },
      test_result: { color: 'green', text: 'Kết quả' },
      instruction: { color: 'purple', text: 'Hướng dẫn' },
      payment: { color: 'orange', text: 'Thanh toán' },
      treatment: { color: 'pink', text: 'Điều trị' },
      review: { color: 'gold', text: 'Đánh giá' },
      blog: { color: 'cyan', text: 'Tin tức' }
    };
    
    return <Tag color={typeMap[type]?.color}>{typeMap[type]?.text}</Tag>;
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setReadVisible(true);
  };
  
  // Action menu for notification items
  const getActionMenu = (notification) => {
    return (
      <Menu>
        <Menu.Item key="mark" icon={notification.read ? <BellOutlined /> : <CheckCircleOutlined />}>
          {notification.read ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
        </Menu.Item>
        <Menu.Item key="delete" icon={<ExclamationCircleOutlined />} danger>
          Xóa thông báo
        </Menu.Item>
      </Menu>
    );
  };
  
  // Render notification list item
  const renderNotificationItem = (notification) => (
    <List.Item
      style={{ 
        opacity: notification.read && readVisible ? 0.7 : 1,
        background: notification.read ? 'transparent' : '#f0f7ff',
        transition: 'all 0.3s'
      }}
      actions={[
        <Dropdown 
          overlay={getActionMenu(notification)} 
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      ]}
      onClick={() => handleNotificationClick(notification)}
    >
      <List.Item.Meta
        avatar={getNotificationIcon(notification.type, notification.priority)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text strong={!notification.read}>{notification.title}</Text>
            {getNotificationTypeTag(notification.type)}
          </div>
        }
        description={
          <div>
            <Paragraph 
              ellipsis={{ rows: 2 }}
              style={{ marginBottom: 4, color: notification.read ? '#666' : '#333' }}
            >
              {notification.content}
            </Paragraph>
            <div style={{ color: '#999', fontSize: '12px' }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {dayjs(notification.time).fromNow()}
            </div>
          </div>
        }
      />
    </List.Item>
  );

  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Title level={5} style={{ margin: 0 }}>Thông Báo</Title>
            <Space>
              <Button size="small">
                Đánh dấu tất cả đã đọc
              </Button>
              <Button size="small" type="primary">
                Cài đặt thông báo
              </Button>
            </Space>
          </div>
        }
      >
        <Tabs
          defaultActiveKey="unread"
          onChange={(key) => setReadVisible(key === "read")}
          items={[
            {
              key: "unread",
              label: (
                <span>
                  Chưa đọc <Badge count={unreadNotifications.length} style={{ marginLeft: 5 }} />
                </span>
              ),
              children: (
                unreadNotifications.length > 0 ? (
                  <List
                    dataSource={unreadNotifications}
                    renderItem={renderNotificationItem}
                    itemLayout="horizontal"
                  />
                ) : (
                  <Empty description="Không có thông báo chưa đọc" />
                )
              )
            },
            {
              key: "read",
              label: "Đã đọc",
              children: (
                readNotifications.length > 0 ? (
                  <List
                    dataSource={readNotifications}
                    renderItem={renderNotificationItem}
                    itemLayout="horizontal"
                  />
                ) : (
                  <Empty description="Không có thông báo đã đọc" />
                )
              )
            }
          ]}
        />
      </Card>

      {/* Notification Detail Modal */}
      <Modal
        title={selectedNotification?.title}
        open={readVisible && selectedNotification !== null}
        onCancel={() => { 
          setReadVisible(false);
          setSelectedNotification(null);
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => { 
              setReadVisible(false);
              setSelectedNotification(null);
            }}
          >
            Đóng
          </Button>,
          <Button 
            key="action" 
            type="primary"
          >
            Xem chi tiết
          </Button>
        ]}
        destroyOnHidden
      >
        {selectedNotification && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                {getNotificationIcon(selectedNotification.type)}
                {getNotificationTypeTag(selectedNotification.type)}
                <Text type="secondary">
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  {dayjs(selectedNotification.time).format("DD/MM/YYYY HH:mm")}
                </Text>
              </Space>
            </div>
            
            <Paragraph style={{ fontSize: 16 }}>
              {selectedNotification.content}
            </Paragraph>
            
            {selectedNotification.type === "appointment" && (
              <Card size="small" style={{ marginTop: 16, background: '#f9f9f9' }}>
                <Text strong>Thông tin lịch hẹn:</Text>
                <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                  <li>Ngày: 22/01/2024</li>
                  <li>Giờ: 09:30</li>
                  <li>Bác sĩ: BS. Nguyễn Văn A</li>
                  <li>Địa điểm: Phòng 105, Tầng 1</li>
                  <li>Chuẩn bị: Mang theo kết quả xét nghiệm trước đó</li>
                </ul>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Notifications; 