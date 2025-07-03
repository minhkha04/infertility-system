import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Spin, 
  Button, 
  Tag, 
  Space, 
  Row, 
  Col, 
  Avatar,
  Timeline,
  Divider,
  Progress,
  Tooltip,
  Badge,
  Descriptions,
  Modal
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CheckCircleOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  MedicineBoxOutlined, 
  ExclamationCircleOutlined,
  ExperimentOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  FileTextOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { treatmentService } from '../../service/treatment.service';
import dayjs from 'dayjs';
import { NotificationContext } from "../../App";

const { Title, Text } = Typography;

const TreatmentStagesView = () => {
  console.log('🚀 TreatmentStagesView component loaded');
  
  const [loading, setLoading] = useState(true);
  const [treatmentData, setTreatmentData] = useState(null);
  const [stepAppointments, setStepAppointments] = useState({});
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleStep, setScheduleStep] = useState(null);

  // Debug log khi treatmentData thay đổi
  useEffect(() => {
    console.log('🔄 TreatmentData state changed:', treatmentData);
    console.log('🔄 Has treatmentSteps?', !!treatmentData?.treatmentSteps);
    console.log('🔄 Steps count:', treatmentData?.treatmentSteps?.length || 0);
    console.log('🔄 Steps data:', treatmentData?.treatmentSteps);
  }, [treatmentData]);

  useEffect(() => {
    const fetchData = async () => {
      console.log('🚀 Starting to fetch treatment data...');

      try {
        const { patientInfo, treatmentData: passedTreatmentData } = location.state || {};
        if (!patientInfo) {
          showNotification("Không tìm thấy thông tin bệnh nhân", "warning");
          navigate(-1);
          return;
        }

        console.log('📋 Received data from ManagerTreatmentRecords:', {
          patientInfo,
          treatmentData: passedTreatmentData
        });

        // Nếu đã có treatmentData với steps thì dùng luôn
        if (passedTreatmentData && passedTreatmentData.id) {
          console.log('✅ Using treatmentData from ManagerTreatmentRecords:', passedTreatmentData.id);
          
          if (passedTreatmentData.treatmentSteps && passedTreatmentData.treatmentSteps.length > 0) {
            console.log('✅ TreatmentData already has steps, using directly');
            setTreatmentData(passedTreatmentData);
            setLoading(false);
            return;
          } else {
            // Gọi API lấy chi tiết để có steps
            console.log('⚠️ TreatmentData missing steps, calling API to get details...');
            try {
              const detailedResponse = await treatmentService.getTreatmentRecordById(passedTreatmentData.id);
              const detailedData = detailedResponse?.data?.result;
              if (detailedData) {
                console.log('✅ Got detailed treatment data with steps');
                setTreatmentData(detailedData);
                setLoading(false);
                return;
              }
            } catch (apiError) {
              console.warn('API call failed, using passed treatmentData:', apiError);
            }
            
            console.log('⚠️ Using passed treatmentData without steps');
            setTreatmentData(passedTreatmentData);
            setLoading(false);
            return;
          }
        }

        // Nếu không có treatmentData từ ManagerTreatmentRecords, báo lỗi
        console.log('❌ No treatmentData received from ManagerTreatmentRecords');
        showNotification("Không nhận được dữ liệu điều trị từ danh sách hồ sơ", "error");
        navigate(-1);
        
      } catch (error) {
        console.error('❌ Error fetching treatment data:', error);
        showNotification("Không thể lấy thông tin điều trị", "error");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "#1890ff";
      case "PLANNED":
        return "#d9d9d9";
      case "COMPLETED":
        return "#52c41a";
      case "CANCELLED":
        return "#ff4d4f";
      case "INPROGRESS":
        return "#fa8c16";
      default:
        return "#d9d9d9";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "PLANNED":
        return "Chờ xếp lịch";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "INPROGRESS":
        return "Đang thực hiện";
      case "PENDING_CHANGE":
        return "Chờ duyệt đổi lịch";
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case "CONFIRMED":
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case "CANCELLED":
        return <CloseOutlined style={{ color: '#ff4d4f' }} />;
      case "PLANNED":
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "CONFIRMED":
        return "blue";
      case "COMPLETED":
        return "green";
      case "CANCELLED":
        return "red";
      case "PENDING_CHANGE":
        return "gold";
      default:
        return "default";
    }
  };

  const getAppointmentStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "PENDING_CHANGE":
        return "Chờ duyệt đổi lịch";
      default:
        return status;
    }
  };

  const fetchAppointmentsForStep = async (stepId) => {
    if (stepAppointments[stepId]) return; // Already loaded
    
    try {
      setLoadingAppointments(true);
      const response = await treatmentService.getAppointmentsByStepId(stepId);
      const appointments = response?.data?.result || [];
      setStepAppointments(prev => ({
        ...prev,
        [stepId]: appointments
      }));
    } catch (error) {
      console.error('Error fetching appointments for step:', stepId, error);
      setStepAppointments(prev => ({
        ...prev,
        [stepId]: []
      }));
    } finally {
      setLoadingAppointments(false);
    }
  };

  const calculateProgress = () => {
    if (!treatmentData?.treatmentSteps) return 0;
    const completedSteps = treatmentData.treatmentSteps.filter(step => step.status === 'COMPLETED').length;
    return Math.round((completedSteps / treatmentData.treatmentSteps.length) * 100);
  };

  // Thêm hàm mở modal xem lịch hẹn của bước
  const handleShowScheduleModal = async (step) => {
    setScheduleStep(step);
    setShowScheduleModal(true);
    setLoadingAppointments(true);
    try {
      const response = await treatmentService.getAppointmentsByStepId(step.id);
      // Lấy đúng mảng appointments (paginated hoặc không)
      let appointments = [];
      if (response?.data?.result?.content) {
        appointments = response.data.result.content;
      } else if (Array.isArray(response?.data?.result)) {
        appointments = response.data.result;
      } else if (Array.isArray(response)) {
        appointments = response;
      }
      setStepAppointments(prev => ({ ...prev, [step.id]: appointments }));
    } catch (error) {
      setStepAppointments(prev => ({ ...prev, [step.id]: [] }));
    } finally {
      setLoadingAppointments(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!treatmentData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Text>Không tìm thấy thông tin điều trị</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            style={{ marginBottom: 16 }}
          >
            Quay lại
          </Button>
          
          <Title level={3}>
            <Space>
              <MedicineBoxOutlined />
              Chi tiết quy trình điều trị
            </Space>
          </Title>
        </div>

        {/* Patient Information */}
        <Card 
          title="Thông tin bệnh nhân" 
          style={{ marginBottom: 24 }}
          size="small"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Space>
                <UserOutlined style={{ color: '#1890ff' }} />
                <Text strong>Tên bệnh nhân:</Text>
                <Text>{treatmentData.customerName}</Text>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space>
                <UserOutlined style={{ color: '#722ed1' }} />
                <Text strong>Bác sĩ:</Text>
                <Text>{treatmentData.doctorName}</Text>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space>
                <CalendarOutlined style={{ color: '#52c41a' }} />
                <Text strong>Ngày bắt đầu:</Text>
                <Text>{dayjs(treatmentData.startDate).format("DD/MM/YYYY")}</Text>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space>
                <MedicineBoxOutlined style={{ color: '#fa8c16' }} />
                <Text strong>Dịch vụ:</Text>
                <Text>{treatmentData.treatmentServiceName}</Text>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space>
                <Text strong>Trạng thái:</Text>
                <Tag 
                  color={getStatusColor(treatmentData.status)}
                  style={{ 
                    fontWeight: 'bold',
                    borderRadius: '6px',
                    padding: '4px 12px',
                    fontSize: '14px'
                  }}
                  icon={getStatusIcon(treatmentData.status)}
                >
                  {getStatusText(treatmentData.status)}
                </Tag>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space>
                <CalendarOutlined style={{ color: '#13c2c2' }} />
                <Text strong>Ngày tạo:</Text>
                <Text>{dayjs(treatmentData.createdDate).format("DD/MM/YYYY")}</Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Progress Bar */}
        {treatmentData.treatmentSteps && treatmentData.treatmentSteps.length > 0 && (
          <Card 
            title="Tiến độ điều trị" 
            style={{ marginBottom: 24 }}
            size="small"
          >
            <Progress 
              percent={calculateProgress()} 
              status={calculateProgress() === 100 ? "success" : "active"}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
              {treatmentData.treatmentSteps.filter(step => step.status === 'COMPLETED').length} / {treatmentData.treatmentSteps.length} bước đã hoàn thành
            </Text>
          </Card>
        )}

        {/* Treatment Steps Timeline */}
        {treatmentData.treatmentSteps && treatmentData.treatmentSteps.length > 0 ? (
          <Card 
            title="Các bước điều trị" 
            style={{ marginBottom: 24 }}
          >
            <Timeline>
              {treatmentData.treatmentSteps.map((step, index) => (
                <Timeline.Item
                  key={step.id}
                  color={getStatusColor(step.status)}
                  dot={getStatusIcon(step.status)}
                >
                  <Card 
                    size="small" 
                    style={{ marginBottom: 16 }}
                    title={
                      <Space>
                        <Text strong>Bước {index + 1}: {step.stageName}</Text>
                        <Tag color={getStatusColor(step.status)}>
                          {getStatusText(step.status)}
                        </Tag>
                      </Space>
                    }
                  >
                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="Mô tả">
                        {step.description || "Không có mô tả"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày dự kiến">
                        {step.scheduledDate ? dayjs(step.scheduledDate).format("DD/MM/YYYY") : "Chưa có lịch"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày thực hiện">
                        {step.actualDate ? dayjs(step.actualDate).format("DD/MM/YYYY") : "Chưa thực hiện"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ghi chú">
                        {step.notes || "Không có ghi chú"}
                      </Descriptions.Item>
                    </Descriptions>
                    <Space style={{ marginTop: 16 }}>
                      <Button type="link" onClick={() => handleShowScheduleModal(step)}>
                        <FileTextOutlined /> Xem lịch hẹn ({stepAppointments[step.id]?.length || 0})
                      </Button>
                    </Space>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        ) : (
          <Card 
            title="Các bước điều trị" 
            style={{ marginBottom: 24 }}
          >
            <Text type="secondary">Chưa có bước điều trị nào được tạo</Text>
          </Card>
        )}
      </Card>

      {/* Modal xem lịch hẹn của bước điều trị */}
      <Modal
        title={<div style={{ textAlign: 'center' }}><FileTextOutlined style={{ fontSize: 24, color: '#faad14', marginRight: 8 }} />Lịch hẹn của bước điều trị</div>}
        open={showScheduleModal}
        onCancel={() => { setShowScheduleModal(false); setScheduleStep(null); }}
        footer={null}
        width={700}
        centered
      >
        <div style={{ marginTop: 0, borderTop: 'none', paddingTop: 0 }}>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 16 }}>
            📅 Các lần hẹn đã đăng ký cho bước này:
          </div>
          {loadingAppointments ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Spin size="large" />
            </div>
          ) : (!stepAppointments[scheduleStep?.id] || stepAppointments[scheduleStep?.id].length === 0) ? (
            <div style={{ color: '#888', textAlign: 'center', padding: 20, background: '#f5f5f5', borderRadius: 8 }}>
              Chưa có lịch hẹn nào cho bước này.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {stepAppointments[scheduleStep?.id]?.map((appointment, idx) => {
                const statusColor = getAppointmentStatusColor(appointment.status);
                const statusIcon = (() => {
                  switch (appointment.status) {
                    case "COMPLETED": return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
                    case "CONFIRMED": return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
                    case "CANCELLED": return <CloseOutlined style={{ color: '#ff4d4f' }} />;
                    case "PENDING": return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
                    case "PENDING_CHANGE": return <SwapOutlined style={{ color: '#faad14' }} />;
                    default: return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
                  }
                })();
                return (
                  <Card
                    key={appointment.id}
                    size="small"
                    style={{
                      width: 220,
                      border: `2px solid ${statusColor === 'default' ? '#d9d9d9' : statusColor}`,
                      borderRadius: 14,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                      position: 'relative',
                      marginBottom: 8,
                      background: '#fff',
                      minHeight: 180
                    }}
                    bodyStyle={{ padding: 16 }}
                  >
                    <div style={{ position: 'absolute', top: 10, right: 10 }}>
                      {statusIcon}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>Ngày hẹn:</Text>
                      <br />
                      <Text>{dayjs(appointment.appointmentDate).format("DD/MM/YYYY")}</Text>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>Ca khám:</Text>
                      <br />
                      <Tag color="cyan">
                        {appointment.shift === "MORNING" ? "Sáng" : appointment.shift === "AFTERNOON" ? "Chiều" : appointment.shift}
                      </Tag>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>Trạng thái:</Text>
                      <br />
                      <Tag color={statusColor}>
                        {getAppointmentStatusText(appointment.status)}
                      </Tag>
                    </div>
                    {appointment.purpose && (
                      <div style={{ marginTop: 8 }}>
                        <Text strong>Mục đích:</Text>
                        <br />
                        <Text>{appointment.purpose}</Text>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TreatmentStagesView; 