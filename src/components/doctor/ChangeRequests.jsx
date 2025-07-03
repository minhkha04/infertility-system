import React, { useEffect, useState, useContext } from 'react';
import { Card, Table, Button, Tag, Modal, Input, message, Spin, Space, Typography, Descriptions, Avatar, Timeline, Divider } from 'antd';
import { treatmentService } from '../../service/treatment.service';
import { authService } from '../../service/auth.service';
import { http } from '../../service/config';
import dayjs from 'dayjs';
import { UserOutlined, CalendarOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { NotificationContext } from '../../App';

const { Title, Text } = Typography;

const ChangeRequests = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [doctorId, setDoctorId] = useState(null);
  const { showNotification } = useContext(NotificationContext);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await authService.getMyInfo();
        setDoctorId(res?.data?.result?.id);
      } catch {}
    };
    fetchDoctor();
  }, []);

  useEffect(() => {
    if (doctorId) fetchRequests();
    // eslint-disable-next-line
  }, [doctorId]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Bước 1: Lấy danh sách PENDING_CHANGE appointments cho doctor này
      const changeRequestsResponse = await treatmentService.getAppointments({
        status: 'PENDING_CHANGE',
        doctorId: doctorId,
        page: 0,
        size: 100
      });
      
      const pendingChangeAppointments = changeRequestsResponse?.data?.result?.content || [];
      console.log('✅ PENDING_CHANGE appointments found for doctor:', pendingChangeAppointments.length);

      // Bước 2: Lấy thông tin chi tiết cho từng PENDING_CHANGE appointment
      const detailedChangeRequests = [];
      for (const appointment of pendingChangeAppointments) {
        try {
          const detailResponse = await http.get(`v1/appointments/${appointment.id}`);
          const detailData = detailResponse?.data?.result;
          if (detailData) {
            // Merge thông tin từ cả 2 API
            const mergedData = {
              ...appointment,
              ...detailData,
              customerName: detailData.customerName || appointment.customerName,
              doctorName: detailData.doctorName || appointment.doctorName,
              appointmentDate: detailData.appointmentDate || appointment.appointmentDate,
              shift: detailData.shift || appointment.shift,
              purpose: appointment.purpose,
              step: appointment.step,
              recordId: appointment.recordId,
              requestedDate: detailData.requestedDate || appointment.requestedDate,
              requestedShift: detailData.requestedShift || appointment.requestedShift
            };
            detailedChangeRequests.push(mergedData);
          }
        } catch (error) {
          console.warn(`Failed to get details for appointment ${appointment.id}:`, error);
          // Fallback: sử dụng data từ API đầu tiên
          detailedChangeRequests.push(appointment);
        }
      }

      console.log('✅ Detailed change requests loaded for doctor:', detailedChangeRequests.length);
      setRequests(detailedChangeRequests);
    } catch (err) {
      showNotification('Không thể tải yêu cầu đổi lịch!', 'error');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const showDetail = (record) => {
    setSelected(record);
    setModalVisible(true);
    setActionType(null);
    setNotes('');
  };

  const handleApproveClick = (record) => {
    setSelected(record);
    setModalVisible(true);
    setActionType('CONFIRMED');
    setNotes('');
  };

  const handleRejectClick = (record) => {
    setSelected(record);
    setModalVisible(true);
    setActionType('REJECTED');
    setNotes('');
  };

  const handleAction = async () => {
    if (!notes || !notes.trim()) {
      showNotification('Vui lòng nhập ghi chú!', 'error');
      return;
    }
    if (!selected) return;
    setActionLoading(true);
    try {
      await treatmentService.confirmAppointmentChange(selected.id, { status: actionType, note: notes });
      showNotification(actionType === 'CONFIRMED' ? 'Đã duyệt yêu cầu!' : 'Đã từ chối yêu cầu!', 'success');
      setModalVisible(false);
      fetchRequests();
    } catch (err) {
      showNotification('Không thể cập nhật yêu cầu!', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: <span><UserOutlined /> Khách hàng</span>,
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <Text strong>{name}</Text>
            {record.customerEmail && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {record.customerEmail}
                </Text>
              </>
            )}
          </div>
        </Space>
      )
    },
    {
      title: 'Mục đích',
      dataIndex: 'purpose',
      key: 'purpose',
      render: (purpose) => (
        <Text>{purpose}</Text>
      )
    },
    {
      title: 'Bước điều trị',
      dataIndex: 'step',
      key: 'step',
      render: (step) => (
        <Text>{step}</Text>
      )
    },
    {
      title: <span><CalendarOutlined /> Ngày hẹn</span>,
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: t => t ? dayjs(t).format('DD/MM/YYYY') : ''
    },
    {
      title: 'Ca cũ',
      dataIndex: 'shift',
      key: 'shift',
      render: s => s === 'MORNING' ? 'Sáng' : s === 'AFTERNOON' ? 'Chiều' : s
    },
    {
      title: 'Đổi sang ngày',
      dataIndex: 'requestedDate',
      key: 'requestedDate',
      render: t => t ? dayjs(t).format('DD/MM/YYYY') : <Text type="secondary">Chưa có thông tin</Text>
    },
    {
      title: 'Ca muốn đổi',
      dataIndex: 'requestedShift',
      key: 'requestedShift',
      render: s => s === 'MORNING' ? 'Sáng' : s === 'AFTERNOON' ? 'Chiều' : s || <Text type="secondary">Chưa có thông tin</Text>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: s => <Tag color="orange">Chờ duyệt</Tag>
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            icon={<EyeOutlined />} 
            onClick={() => showDetail(record)}
          >
            Chi tiết
          </Button>
          <Button 
            type="primary" 
            size="small"
            icon={<EditOutlined />} 
            onClick={() => handleApproveClick(record)}
          >
            Duyệt
          </Button>
          <Button 
            danger 
            size="small"
            icon={<CloseCircleOutlined />} 
            onClick={() => handleRejectClick(record)}
          >
            Từ chối
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card 
        title={<Space><SyncOutlined spin style={{ color: '#faad14' }} /> <span>Yêu cầu đổi lịch hẹn từ khách hàng</span></Space>}
        style={{ maxWidth: 1200, margin: '0 auto', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
        styles={{ body: { padding: 24 } }}
        hoverable
      >
        <Spin spinning={loading} tip="Đang tải...">
          <Table 
            columns={columns} 
            dataSource={requests} 
            rowKey="id" 
            pagination={{ pageSize: 8 }}
            bordered
            size="middle"
            style={{ background: 'white', borderRadius: 8 }}
            scroll={{ x: 'max-content' }}
          />
        </Spin>
        <Modal
          title={actionType === 'CONFIRMED' ? 'Duyệt yêu cầu đổi lịch' : actionType === 'REJECTED' ? 'Từ chối yêu cầu đổi lịch' : 'Chi tiết yêu cầu đổi lịch'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          centered
          destroyOnHidden
          width={700}
        >
          {selected && (
            <div style={{ padding: 8 }}>
              <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
                <Descriptions.Item label="Khách hàng" span={2}>
                  <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div>
                      <Text strong>{selected.customerName}</Text>
                      {selected.customerEmail && (
                        <>
                          <br />
                          <Text type="secondary">{selected.customerEmail}</Text>
                        </>
                      )}
                    </div>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Mục đích">
                  <Text>{selected.purpose}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Bước điều trị">
                  <Text>{selected.step}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  <Text>{selected.createdAt ? dayjs(selected.createdAt).format('DD/MM/YYYY') : ''}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Mã hồ sơ">
                  <Text code>{selected.recordId}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Đổi sang ngày">
                  {selected.requestedDate
                    ? dayjs(selected.requestedDate).format("DD/MM/YYYY")
                    : <Text type="secondary">Chưa có thông tin</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Ca muốn đổi">
                  {selected.requestedShift === "MORNING"
                    ? "Sáng"
                    : selected.requestedShift === "AFTERNOON"
                    ? "Chiều"
                    : <Text type="secondary">Chưa có thông tin</Text>}
                </Descriptions.Item>
              </Descriptions>

              <Timeline>
                <Timeline.Item color="blue">
                  <Card size="small" title="Thông tin hiện tại">
                    <Space direction="vertical" size="small">
                      <Text strong>Ngày hiện tại: {selected.appointmentDate ? dayjs(selected.appointmentDate).format('DD/MM/YYYY') : ''}</Text>
                      <Tag color="blue">
                        Ca hiện tại: {selected.shift === 'MORNING' ? 'Sáng' : selected.shift === 'AFTERNOON' ? 'Chiều' : selected.shift}
                      </Tag>
                    </Space>
                  </Card>
                </Timeline.Item>
                <Timeline.Item color="orange">
                  <Card size="small" title="Yêu cầu thay đổi">
                    <Space direction="vertical" size="small">
                      <Text strong style={{ color: '#faad14' }}>
                        Ngày yêu cầu: {selected.requestedDate ? dayjs(selected.requestedDate).format('DD/MM/YYYY') : 'Chưa có thông tin'}
                      </Text>
                      <Tag color="gold">
                        Ca yêu cầu: {selected.requestedShift === 'MORNING' ? 'Sáng' : selected.requestedShift === 'AFTERNOON' ? 'Chiều' : selected.requestedShift || 'Chưa có thông tin'}
                      </Tag>
                    </Space>
                  </Card>
                </Timeline.Item>
              </Timeline>

              {selected.notes && (
                <>
                  <Divider />
                  <Card size="small" title="Ghi chú">
                    <Text>{selected.notes}</Text>
                  </Card>
                </>
              )}
              
              {actionType && (
                <>
                  <Divider />
                  <Input.TextArea
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Nhập ghi chú bắt buộc"
                    style={{ marginBottom: 16 }}
                  />
                  <Space style={{ width: '100%', justifyContent: 'center' }}>
                    <Button 
                      type={actionType === 'CONFIRMED' ? 'primary' : 'default'}
                      danger={actionType === 'REJECTED'}
                      icon={actionType === 'CONFIRMED' ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                      loading={actionLoading} 
                      onClick={handleAction}
                      style={{ minWidth: 120 }}
                    >
                      {actionType === 'CONFIRMED' ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu'}
                    </Button>
                  </Space>
                </>
              )}
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default ChangeRequests; 