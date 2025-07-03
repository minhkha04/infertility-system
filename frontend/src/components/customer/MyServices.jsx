import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Spin,
  Button,
} from "antd";
import {
  ExperimentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { treatmentService } from "../../service/treatment.service";
import { authService } from "../../service/auth.service";
import { useNavigate } from "react-router-dom";
import { customerService } from "../../service/customer.service";
import { path } from "../../common/path";
import { NotificationContext } from "../../App";

const { Title, Text } = Typography;

const MyServices = () => {
  const { showNotification } = useContext(NotificationContext);
  const [loading, setLoading] = useState(true);
  const [treatmentRecords, setTreatmentRecords] = useState([]);
  const [statistics, setStatistics] = useState({
    totalServices: 0,
    cancelledServices: 0,
    inProgressServices: 0,
  });
  const [cancelLoading, setCancelLoading] = useState({});
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTreatmentRecords();
    const fetchUser = async () => {
      try {
        const res = await authService.getMyInfo();
        setUserId(res?.data?.result?.id);
      } catch {}
    };
    fetchUser();
  }, []);

  const fetchTreatmentRecords = async () => {
    try {
      setLoading(true);
      const userResponse = await authService.getMyInfo();

      if (!userResponse?.data?.result?.id) {
        showNotification("Không tìm thấy thông tin người dùng", "error");
        return;
      }

      const customerId = userResponse.data.result.id;

      // Tạm thời cho phép sử dụng test data
      if (!customerId) {
        showNotification(
          "ID người dùng không hợp lệ. Vui lòng đăng nhập lại.",
          "error"
        );
        return;
      }

      // Cảnh báo nếu đang sử dụng test data
      // (Đã xóa thông báo demo, chỉ dùng dữ liệu thật)

      const response = await treatmentService.getTreatmentRecords({
        customerId: customerId,
        page: 0,
        size: 100,
      });

      if (response?.data?.result?.content) {
        const records = response.data.result.content;
        console.log(records);

        // chỉ cho nhấn feedback khi đã hoàn thành hồ sơ điều trị
        const enrichedRecords = records.map((record) => ({
          ...record,
          canFeedback: record.status === "COMPLETED",
        }));
        setTreatmentRecords(enrichedRecords);

        const stats = {
          totalServices: records.length,
          cancelledServices: records.filter((r) => r.status === "CANCELLED")
            .length,
          inProgressServices: records.filter((r) => r.status === "INPROGRESS")
            .length,
        };
        setStatistics(stats);
      }
    } catch (error) {
      console.error("Error fetching treatment records:", error);
      showNotification("Có lỗi xảy ra khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "COMPLETED":
        return <Tag color="success">Hoàn thành</Tag>;
      case "INPROGRESS":
        return <Tag color="#1890ff">Đang điều trị</Tag>;
      case "PENDING":
        return <Tag color="warning">Đang chờ điều trị</Tag>;
      case "CANCELLED":
        return <Tag color="error">Đã hủy</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const handleCancelTreatment = async (record) => {
    if (!userId) return;
    setCancelLoading((l) => ({ ...l, [record.id]: true }));
    try {
      await treatmentService.cancelTreatmentRecord(record.id);
      showNotification("Hủy hồ sơ điều trị thành công.", "success");
      fetchTreatmentRecords();
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || "Không thể hủy hồ sơ điều trị này.";
      if (errorMessage.includes("in progress")) {
        showNotification(
          "Hủy thất bại do bạn đang trong quá trình điều trị.",
          "error"
        );
      } else if (errorMessage.includes("completed")) {
        showNotification("Hủy thất bại do dịch vụ đã hoàn thành.", "error");
      } else {
        showNotification(errorMessage, "error");
      }
    } finally {
      setCancelLoading((l) => ({ ...l, [record.id]: false }));
    }
  };

  const handleOpenFeedbackForm = (record) => {
    if (!record.canFeedback) return;
    navigate(path.customerFeedback, {
      state: {
        recordId: record.id,
      },
    });
  };

  const handleViewTreatmentProgress = (record) => {
    console.log("👉 [MyServices] Chuyển sang TreatmentProgress với:", record);
    navigate(path.customerTreatment, {
      state: {
        treatmentRecord: record,
        treatmentId: record.id,
      },
    });
  };

  const columns = [
    {
      title: "Gói điều trị",
      dataIndex: "serviceName",
      key: "serviceName",
      render: (text) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Bác sĩ phụ trách",
      dataIndex: "doctorName",
      key: "doctorName",
      render: (text) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => (
        <span>{text ? new Date(text).toLocaleDateString("vi-VN") : "N/A"}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => getStatusTag(status),
    },
    {
      title: "Tiến độ",
      dataIndex: "progress",
      key: "progress",
      render: (_, record) => {
        const totalSteps = record.totalSteps || 0;
        const completedSteps = record.completedSteps || 0;

        if (!totalSteps) return "0%";
        const percentage = Math.round((completedSteps / totalSteps) * 100);
        return `${completedSteps}/${totalSteps} (${percentage}%)`;
      },
    },
    {
      title: "Chi tiết dịch vụ",
      key: "details",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          style={{
            backgroundColor: "#ff6b35",
            borderColor: "#ff6b35",
            color: "#fff",
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleViewTreatmentProgress(record);
          }}
        >
          Xem
        </Button>
      ),
    },
    {
      title: "Yêu cầu hủy",
      key: "cancel",
      render: (_, record) => (
        <Button
          danger
          loading={!!cancelLoading[record.id]}
          onClick={(e) => {
            e.stopPropagation();
            handleCancelTreatment(record);
          }}
          disabled={!userId || record.status === "CANCELLED"}
          style={
            record.status === "CANCELLED"
              ? { opacity: 0.5, cursor: "not-allowed" }
              : {}
          }
        >
          Hủy dịch vụ
        </Button>
      ),
    },
    {
      title: "Tạo feedback",
      key: "feedback",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenFeedbackForm(record);
            console.log(record.id);
          }}
          disabled={!record.canFeedback}
        >
          Feedback
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Title
        level={4}
        style={{
          marginBottom: 24,
          color: "#1890ff",
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        Dịch vụ của tôi
      </Title>

      <Row gutter={32} style={{ marginBottom: 32, justifyContent: "center" }}>
        <Col xs={24} sm={8}>
          <Card
            variant="outlined"
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 16px rgba(24,144,255,0.08)",
              background: "#fff",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "#1890ff", fontWeight: 600 }}>
                  Tổng số dịch vụ
                </span>
              }
              value={statistics.totalServices}
              prefix={<ExperimentOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ fontSize: 32, color: "#1890ff", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            variant="outlined"
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 16px rgba(255,77,79,0.08)",
              background: "#fff",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "#ff4d4f", fontWeight: 600 }}>
                  Đã hủy
                </span>
              }
              value={statistics.cancelledServices}
              prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ fontSize: 32, color: "#ff4d4f", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            variant="outlined"
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 16px rgba(24,144,255,0.08)",
              background: "#fff",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "#1890ff", fontWeight: 600 }}>
                  Đang thực hiện
                </span>
              }
              value={statistics.inProgressServices}
              prefix={<CheckCircleOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ fontSize: 32, color: "#1890ff", fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        variant="outlined"
        style={{
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(24,144,255,0.06)",
          background: "#fff",
        }}
      >
        <Table
          columns={columns}
          dataSource={treatmentRecords}
          rowKey="id"
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showTotal: (total) => `Tổng số ${total} dịch vụ`,
          }}
          bordered
          style={{ borderRadius: 12, overflow: "hidden" }}
        />
      </Card>
    </div>
  );
};

export default MyServices;
