import React, { useState } from "react";
import { 
  Card, Tabs, Table, Tag, Button, Typography, 
  Row, Col, Timeline, Modal, Descriptions
} from "antd";
import {
  FileTextOutlined, HeartOutlined, ExperimentOutlined,
  CalendarOutlined, UserOutlined, EyeOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const MedicalRecord = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Mock medical records
  const medicalHistory = [
    {
      id: 1,
      date: "2024-01-15",
      doctor: "BS. Nguyễn Văn A",
      diagnosis: "Hiếm muộn nguyên phát",
      treatment: "Tư vấn ban đầu và lập kế hoạch điều trị IVF",
      notes: "Bệnh nhân đã kết hôn 3 năm, chưa có con. Khám lâm sàng bình thường.",
      prescription: "Folic acid 5mg, Vitamin E"
    },
    {
      id: 2,
      date: "2024-01-20",
      doctor: "BS. Nguyễn Văn A",
      diagnosis: "Theo dõi kích thích buồng trứng",
      treatment: "Siêu âm theo dõi phản ứng với hormone kích thích",
      notes: "Buồng trứng phản ứng tốt với FSH. Có 8 nang trứng phát triển.",
      prescription: "Tiếp tục FSH 150IU/ngày"
    }
  ];

  const testResults = [
    {
      id: 1,
      date: "2024-01-12",
      type: "Hormone",
      testName: "AMH, FSH, LH, E2",
      status: "completed",
      results: {
        AMH: { value: "2.8 ng/ml", range: "1.5-4.0", status: "normal" },
        FSH: { value: "6.2 mIU/ml", range: "3.5-12.5", status: "normal" },
        LH: { value: "4.8 mIU/ml", range: "2.4-12.6", status: "normal" },
        E2: { value: "45 pg/ml", range: "12.5-166", status: "normal" }
      }
    },
    {
      id: 2,
      date: "2024-01-14",
      type: "Siêu âm",
      testName: "Siêu âm buồng trứng",
      status: "completed",
      results: "Buồng trứng trái: 6 nang trứng. Buồng trứng phải: 7 nang trứng. Tử cung bình thường."
    },
    {
      id: 3,
      date: "2024-01-20",
      type: "Siêu âm",
      testName: "Theo dõi kích thích buồng trứng",
      status: "completed",
      results: "8 nang trứng phát triển tốt, kích thước 14-18mm. Nội mạc tử cung dày 9mm."
    },
    {
      id: 4,
      date: "2024-01-25",
      type: "Di truyền",
      testName: "Xét nghiệm di truyền tiền làm tổ",
      status: "pending",
      results: "Chờ kết quả"
    }
  ];

  const prescriptions = [
    {
      id: 1,
      date: "2024-01-15",
      doctor: "BS. Nguyễn Văn A",
      medications: [
        { name: "Folic Acid", dosage: "5mg", frequency: "1 lần/ngày", duration: "3 tháng" },
        { name: "Vitamin E", dosage: "400IU", frequency: "1 lần/ngày", duration: "3 tháng" }
      ]
    },
    {
      id: 2,
      date: "2024-01-18",
      doctor: "BS. Nguyễn Văn A",
      medications: [
        { name: "FSH (Gonal-F)", dosage: "150IU", frequency: "1 lần/ngày", duration: "10 ngày" },
        { name: "LH (Luveris)", dosage: "75IU", frequency: "1 lần/ngày", duration: "từ ngày 6" }
      ]
    }
  ];

  const getStatusTag = (status) => {
    const statusMap = {
      completed: { color: "green", text: "Hoàn thành" },
      pending: { color: "orange", text: "Chờ kết quả" },
      normal: { color: "green", text: "Bình thường" },
      abnormal: { color: "red", text: "Bất thường" }
    };
    return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>;
  };

  const viewRecord = (record) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const medicalHistoryColumns = [
    {
      title: "Ngày khám",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("DD/MM/YYYY")
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctor",
      key: "doctor"
    },
    {
      title: "Chẩn đoán",
      dataIndex: "diagnosis",
      key: "diagnosis"
    },
    {
      title: "Điều trị",
      dataIndex: "treatment",
      key: "treatment"
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => viewRecord(record)}>
          Chi tiết
        </Button>
      )
    }
  ];

  const testResultColumns = [
    {
      title: "Ngày xét nghiệm",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("DD/MM/YYYY")
    },
    {
      title: "Loại xét nghiệm",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: "Tên xét nghiệm",
      dataIndex: "testName",
      key: "testName"
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: getStatusTag
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => viewRecord(record)}>
          Xem kết quả
        </Button>
      )
    }
  ];

  return (
    <div>
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <div style={{ marginTop: 8 }}>
                <Text strong>Lần khám</Text>
                <br />
                <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                  {medicalHistory.length}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ExperimentOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
              <div style={{ marginTop: 8 }}>
                <Text strong>Xét nghiệm</Text>
                <br />
                <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                  {testResults.length}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <HeartOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />
              <div style={{ marginTop: 8 }}>
                <Text strong>Đơn thuốc</Text>
                <br />
                <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#fa8c16' }}>
                  {prescriptions.length}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CalendarOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
              <div style={{ marginTop: 8 }}>
                <Text strong>Ngày bắt đầu</Text>
                <br />
                <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#722ed1' }}>
                  {dayjs('2024-01-10').format("DD/MM/YYYY")}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Medical Records Tabs */}
      <Card>
        <Tabs 
          defaultActiveKey="history"
          items={[
            {
              key: "history",
              label: "Lịch sử khám bệnh",
              children: (
                <Table
                  columns={medicalHistoryColumns}
                  dataSource={medicalHistory}
                  pagination={false}
                />
              )
            },
            {
              key: "tests",
              label: "Kết quả xét nghiệm",
              children: (
                <Table
                  columns={testResultColumns}
                  dataSource={testResults}
                  pagination={false}
                />
              )
            },
            {
              key: "prescriptions",
              label: "Đơn thuốc",
              children: (
                <>
                  {prescriptions.map(prescription => (
                    <Card key={prescription.id} size="small" style={{ marginBottom: 16 }}>
                      <div style={{ marginBottom: 12 }}>
                        <Text strong>Ngày kê đơn: </Text>
                        <Text>{dayjs(prescription.date).format("DD/MM/YYYY")}</Text>
                        <br />
                        <Text strong>Bác sĩ: </Text>
                        <Text>{prescription.doctor}</Text>
                      </div>
                      <Table
                        size="small"
                        dataSource={prescription.medications}
                        pagination={false}
                        columns={[
                          { title: "Tên thuốc", dataIndex: "name", key: "name" },
                          { title: "Liều dùng", dataIndex: "dosage", key: "dosage" },
                          { title: "Tần suất", dataIndex: "frequency", key: "frequency" },
                          { title: "Thời gian", dataIndex: "duration", key: "duration" }
                        ]}
                      />
                    </Card>
                  ))}
                </>
              )
            },
            {
              key: "timeline",
              label: "Tiến trình điều trị",
              children: (
                <Timeline>
                  <Timeline.Item color="green">
                    <Text strong>15/01/2024 - Khám tư vấn ban đầu</Text>
                    <br />
                    <Text type="secondary">Chẩn đoán hiếm muộn nguyên phát, lập kế hoạch IVF</Text>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <Text strong>16/01/2024 - Bắt đầu điều trị</Text>
                    <br />
                    <Text type="secondary">Kê đơn thuốc chuẩn bị và kích thích buồng trứng</Text>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <Text strong>20/01/2024 - Theo dõi điều trị</Text>
                    <br />
                    <Text type="secondary">Siêu âm kiểm tra phản ứng với hormone</Text>
                  </Timeline.Item>
                  <Timeline.Item>
                    <Text strong>25/01/2024 - Xét nghiệm di truyền</Text>
                    <br />
                    <Text type="secondary">Dự kiến có kết quả trong 7-10 ngày</Text>
                  </Timeline.Item>
                  <Timeline.Item>
                    <Text strong>30/01/2024 - Thủ thuật lấy trứng</Text>
                    <br />
                    <Text type="secondary">Dự kiến thực hiện thủ thuật lấy trứng</Text>
                  </Timeline.Item>
                </Timeline>
              )
            }
          ]}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi Tiết Hồ Sơ"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedRecord && (
          <div>
            {selectedRecord.diagnosis ? (
              // Medical history detail
              <div>
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Ngày khám">
                    {dayjs(selectedRecord.date).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Bác sĩ">
                    {selectedRecord.doctor}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chẩn đoán" span={2}>
                    {selectedRecord.diagnosis}
                  </Descriptions.Item>
                  <Descriptions.Item label="Điều trị" span={2}>
                    {selectedRecord.treatment}
                  </Descriptions.Item>
                </Descriptions>
                
                <div style={{ marginTop: 16 }}>
                  <Title level={5}>Ghi chú:</Title>
                  <Text>{selectedRecord.notes}</Text>
                </div>
                
                {selectedRecord.prescription && (
                  <div style={{ marginTop: 16 }}>
                    <Title level={5}>Đơn thuốc:</Title>
                    <Text>{selectedRecord.prescription}</Text>
                  </div>
                )}
              </div>
            ) : (
              // Test result detail
              <div>
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Ngày xét nghiệm">
                    {dayjs(selectedRecord.date).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại xét nghiệm">
                    <Tag color="blue">{selectedRecord.type}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên xét nghiệm" span={2}>
                    {selectedRecord.testName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái" span={2}>
                    {getStatusTag(selectedRecord.status)}
                  </Descriptions.Item>
                </Descriptions>
                
                <div style={{ marginTop: 16 }}>
                  <Title level={5}>Kết quả:</Title>
                  {typeof selectedRecord.results === 'object' ? (
                    <Table
                      size="small"
                      dataSource={Object.entries(selectedRecord.results).map(([key, value]) => ({
                        key,
                        test: key,
                        ...value
                      }))}
                      columns={[
                        { title: "Chỉ số", dataIndex: "test", key: "test" },
                        { title: "Kết quả", dataIndex: "value", key: "value" },
                        { title: "Tham chiếu", dataIndex: "range", key: "range" },
                        { 
                          title: "Đánh giá", 
                          dataIndex: "status", 
                          key: "status",
                          render: getStatusTag
                        }
                      ]}
                      pagination={false}
                    />
                  ) : (
                    <Text>{selectedRecord.results}</Text>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalRecord; 