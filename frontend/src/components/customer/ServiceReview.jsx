import React, { useState } from "react";
import { 
  Card, Table, Rate, Button, Typography, Input, 
  Modal, Form, Tag, Space, Avatar, Divider, Empty
} from "antd";
import {
  StarOutlined, CommentOutlined, MedicineBoxOutlined,
  UserOutlined, CalendarOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ServiceReview = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  
  // Mock data for reviews
  const reviews = [
    {
      id: 1,
      serviceId: "SV001",
      serviceName: "Tư vấn Ban đầu",
      doctor: "BS. Nguyễn Văn A",
      date: "2024-01-15",
      reviewed: true,
      rating: 5,
      comment: "Bác sĩ rất nhiệt tình, tư vấn chi tiết và giải đáp mọi thắc mắc của tôi.",
      reviewDate: "2024-01-16"
    },
    {
      id: 2,
      serviceId: "SV002",
      serviceName: "IVF Tiêu chuẩn",
      doctor: "BS. Nguyễn Văn A",
      date: "2024-01-20",
      reviewed: true,
      rating: 4,
      comment: "Dịch vụ tốt, nhân viên chuyên nghiệp. Tuy nhiên thời gian chờ hơi lâu.",
      reviewDate: "2024-01-21"
    },
    {
      id: 3,
      serviceId: "SV003",
      serviceName: "Xét nghiệm Di truyền",
      doctor: "BS. Trần Thị B",
      date: "2024-01-25",
      reviewed: false,
      rating: 0,
      comment: "",
      reviewDate: null
    }
  ];

  // Function to open review modal
  const openReviewModal = (service) => {
    setSelectedService(service);
    form.setFieldsValue({
      rating: service.rating || 0,
      comment: service.comment || ""
    });
    setModalVisible(true);
  };

  // Function to submit review
  const handleReviewSubmit = (values) => {
    console.log("Submitted review for service:", selectedService.serviceId, values);
    // In a real app, would send this to an API
    setModalVisible(false);
    
    // Mock update the review data
    // This would be handled by an API call in a real application
  };

  // Table columns
  const columns = [
    {
      title: "Dịch vụ",
      dataIndex: "serviceName",
      key: "serviceName",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <div>
            <Tag color="blue">{record.serviceId}</Tag>
          </div>
        </div>
      )
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctor",
      key: "doctor",
      render: (doctor) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          {doctor}
        </Space>
      )
    },
    {
      title: "Ngày sử dụng",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <span>
          <CalendarOutlined style={{ marginRight: 8 }} />
          {dayjs(date).format("DD/MM/YYYY")}
        </span>
      )
    },
    {
      title: "Đánh giá",
      key: "rating",
      render: (_, record) => (
        <div>
          {record.reviewed ? (
            <Rate disabled defaultValue={record.rating} />
          ) : (
            <Text type="secondary">Chưa đánh giá</Text>
          )}
        </div>
      )
    },
    {
      title: "Nhận xét",
      key: "comment",
      render: (_, record) => (
        <div>
          {record.reviewed ? (
            <Paragraph ellipsis={{ rows: 2 }}>
              {record.comment}
            </Paragraph>
          ) : (
            <Text type="secondary">Chưa có nhận xét</Text>
          )}
        </div>
      )
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type={record.reviewed ? "default" : "primary"}
          onClick={() => openReviewModal(record)}
        >
          {record.reviewed ? "Chỉnh sửa" : "Đánh giá"}
        </Button>
      )
    }
  ];

  const summarySection = () => {
    const reviewCount = reviews.filter(r => r.reviewed).length;
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;
    
    return (
      <Card style={{ marginBottom: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={4}>Đánh giá của bạn</Title>
          <div style={{ fontSize: 64, color: '#faad14', lineHeight: 1 }}>
            {avgRating}
          </div>
          <Rate disabled allowHalf value={parseFloat(avgRating)} />
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">Dựa trên {reviewCount} đánh giá</Text>
          </div>
          
          <Divider />
          
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <div style={{ color: '#52c41a', fontSize: 24, fontWeight: 'bold' }}>
                {reviews.filter(r => r.rating === 5).length}
              </div>
              <div>Rất hài lòng</div>
            </div>
            <div>
              <div style={{ color: '#1890ff', fontSize: 24, fontWeight: 'bold' }}>
                {reviews.filter(r => r.rating === 4).length}
              </div>
              <div>Hài lòng</div>
            </div>
            <div>
              <div style={{ color: '#faad14', fontSize: 24, fontWeight: 'bold' }}>
                {reviews.filter(r => r.rating === 3).length}
              </div>
              <div>Bình thường</div>
            </div>
            <div>
              <div style={{ color: '#ff4d4f', fontSize: 24, fontWeight: 'bold' }}>
                {reviews.filter(r => r.rating <= 2).length}
              </div>
              <div>Không hài lòng</div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div>
      {/* Summary */}
      {summarySection()}
      
      {/* Reviews Table */}
      <Card title="Danh sách dịch vụ để đánh giá">
        {reviews.length > 0 ? (
          <Table
            columns={columns}
            dataSource={reviews}
            pagination={false}
            rowKey="id"
          />
        ) : (
          <Empty description="Bạn chưa sử dụng dịch vụ nào để đánh giá" />
        )}
      </Card>

      {/* Guidelines */}
      <Card title="Hướng dẫn đánh giá" style={{ marginTop: 24 }}>
        <div style={{ color: '#666' }}>
          <p>
            <strong>Tại sao đánh giá của bạn quan trọng?</strong>
          </p>
          <p>
            Đánh giá của bạn giúp chúng tôi cải thiện chất lượng dịch vụ và giúp các khách hàng khác 
            hiểu rõ hơn về dịch vụ của chúng tôi.
          </p>
          <p>
            <strong>Tiêu chí đánh giá:</strong>
          </p>
          <ul>
            <li>Thái độ phục vụ của bác sĩ và nhân viên</li>
            <li>Chất lượng dịch vụ và cơ sở vật chất</li>
            <li>Thời gian chờ đợi và quy trình khám</li>
            <li>Sự rõ ràng trong tư vấn và hướng dẫn</li>
          </ul>
          <p>
            <strong>Lưu ý:</strong> Đánh giá của bạn có thể được hiển thị công khai (không bao gồm thông tin cá nhân).
          </p>
        </div>
      </Card>

      {/* Review Modal */}
      <Modal
        title={
          selectedService?.reviewed 
            ? "Chỉnh sửa đánh giá" 
            : "Đánh giá dịch vụ"
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedService && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>{selectedService.serviceName}</Text>
              <div>
                <Text type="secondary">
                  Bác sĩ: {selectedService.doctor} | Ngày: {dayjs(selectedService.date).format("DD/MM/YYYY")}
                </Text>
              </div>
            </div>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleReviewSubmit}
            >
              <Form.Item
                name="rating"
                label="Đánh giá của bạn"
                rules={[{ required: true, message: "Vui lòng chọn số sao" }]}
              >
                <Rate />
              </Form.Item>
              
              <Form.Item
                name="comment"
                label="Nhận xét"
                rules={[{ required: true, message: "Vui lòng nhập nhận xét" }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Chia sẻ trải nghiệm của bạn với dịch vụ này..." 
                />
              </Form.Item>
              
              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setModalVisible(false)}>
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    {selectedService.reviewed ? "Cập nhật" : "Gửi đánh giá"}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ServiceReview; 