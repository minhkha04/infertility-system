import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Steps,
  Row,
  Col,
  Typography,
  Descriptions,
  Tag,
  Timeline,
  Space,
  Divider,
  Progress,
  Collapse,
  Spin,
  message,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  Alert,
  Table,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  CalendarOutlined,
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined as ClockIcon,
  CheckCircleOutlined as CheckIcon,
  InfoCircleOutlined,
  AppstoreOutlined,
  DeploymentUnitOutlined,
  ExperimentOutlined as TestTubeIcon,
  ArrowLeftOutlined,
  EditOutlined,
  RightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { treatmentService } from "../../service/treatment.service";
import { authService } from "../../service/auth.service";
import { useNavigate, useLocation } from "react-router-dom";
import { path } from "../../common/path";
import { NotificationContext } from "../../App";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

const TreatmentProgress = () => {
  const [loading, setLoading] = useState(true);
  const [treatmentData, setTreatmentData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [changeModalVisible, setChangeModalVisible] = useState(false);
  const [changeStep, setChangeStep] = useState(null);
  const [changeAppointment, setChangeAppointment] = useState(null);
  const [changeForm] = Form.useForm();
  const [changeLoading, setChangeLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState("list");
  const [treatments, setTreatments] = useState([]);
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    if (location.state?.treatmentRecord && location.state?.treatmentId) {
      setViewMode("detail");
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const treatmentRecord = location.state?.treatmentRecord;
      const treatmentId = location.state?.treatmentId;

      if (treatmentRecord && treatmentId) {
        const detailResponse = await treatmentService.getTreatmentRecordById(
          treatmentId
        );
        const detailData = detailResponse?.data?.result;

        if (detailData) {
          const totalSteps = detailData.treatmentSteps?.length || 0;
          const completedSteps =
            detailData.treatmentSteps?.filter(
              (step) => step.status === "COMPLETED"
            ).length || 0;
          const overallProgress =
            totalSteps > 0
              ? Math.round((completedSteps / totalSteps) * 100)
              : 0;

          setTreatmentData({
            id: detailData.id,
            type: detailData.treatmentServiceName,
            startDate: detailData.startDate,
            currentPhase:
              detailData.treatmentSteps?.findIndex(
                (step) => step.status === "COMPLETED"
              ) + 1 || 1,
            doctor: detailData.doctorName,
            status: detailData.status.toLowerCase(),
            estimatedCompletion:
              detailData.endDate ||
              dayjs(detailData.startDate).add(45, "days").format("YYYY-MM-DD"),
            nextAppointment: null,
            overallProgress: overallProgress,
            customerId: detailData.customerId,
            phases:
              detailData.treatmentSteps?.map((step, index) => ({
                id: step.id,
                name: step.name,
                statusRaw: step.status,
                status: step.status,
                displayDate: step.scheduledDate || null,
                hasDate: !!step.scheduledDate,
                startDate: step.scheduledDate,
                endDate: step.actualDate,
                notes: step.notes || "",
                appointment: null,
                activities: [
                  {
                    name: step.name,
                    date: step.scheduledDate,
                    status: step.status,
                    notes: step.notes || "",
                  },
                ],
              })) || [],
          });
        }
      } else {
        const userResponse = await authService.getMyInfo();

        if (!userResponse?.data?.result?.id) {
          message.error(
            "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
          );
          return;
        }

        const customerId = userResponse.data.result.id;

        // Tạm thời cho phép sử dụng test data
        if (!customerId) {
          message.error("ID người dùng không hợp lệ. Vui lòng đăng nhập lại.");
          return;
        }

        // Cảnh báo nếu đang sử dụng test data
        // (Đã xóa thông báo demo, chỉ dùng dữ liệu thật)

        const response = await treatmentService.getTreatmentRecords({
          customerId: customerId,
          page: 0,
          size: 100,
        });

        if (response?.data?.code === 1000 && response.data.result?.content) {
          const treatmentRecords = response.data.result.content
            .filter((treatment) => treatment.status !== "CANCELLED")
            .sort(
              (a, b) =>
                new Date(b.createdDate || b.startDate) -
                new Date(a.createdDate || a.startDate)
            );

          setTreatments(
            treatmentRecords.map((treatment) => {
              const totalSteps = treatment.totalSteps || 0;
              const completedSteps = treatment.completedSteps || 0;
              const progress =
                totalSteps > 0
                  ? Math.round((completedSteps / totalSteps) * 100)
                  : 0;

              return {
                key: treatment.id,
                id: treatment.id,
                serviceName: treatment.serviceName,
                doctorName: treatment.doctorName,
                startDate: treatment.startDate,
                status: treatment.status,
                progress: progress,
                totalSteps: treatment.totalSteps,
                completedSteps: treatment.completedSteps,
                customerId: customerId,
              };
            })
          );
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Có lỗi xảy ra khi tải dữ liệu");
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChangeModal = async (step) => {
    setChangeStep(step);
    setChangeAppointment(null);
    setChangeModalVisible(true);
    setChangeLoading(true);

    try {
      // Lấy appointments thật cho step này
      if (step.appointment?.id) {
        // Nếu đã có appointment, sử dụng luôn
        setChangeAppointment([step.appointment]);
      } else {
        // Lấy appointments theo step ID
        const appointmentsResponse = await treatmentService.getAppointments({
          stepId: step.id,
          customerId: treatmentData.customerId,
          status: "CONFIRMED,PENDING", // Chỉ lấy appointments có thể đổi
          page: 0,
          size: 10,
        });

        const appointments = appointmentsResponse?.data?.result?.content || [];
        setChangeAppointment(appointments);
      }
    } catch (error) {
      console.error("Lỗi khi mở modal đổi lịch:", error);
      message.error("Không thể mở form đổi lịch hẹn");
      setChangeAppointment([]);
    } finally {
      setChangeLoading(false);
    }
  };

  const handleSubmitChange = async () => {
    if (!selectedAppointment) {
      showNotification("Vui lòng chọn lịch hẹn để thay đổi", "error");
      return;
    }

    try {
      setChangeLoading(true);
      const values = await changeForm.validateFields();

      console.log("=== CHANGE REQUEST DEBUG ===");
      console.log("Selected appointment:", selectedAppointment);
      console.log(
        "Appointment ID:",
        selectedAppointment.id,
        "Type:",
        typeof selectedAppointment.id
      );
      console.log("Appointment status:", selectedAppointment.status);
      console.log("Appointment customer:", selectedAppointment.customerName);
      console.log("Form values:", values);
      console.log(
        "Sending change request for appointment ID:",
        selectedAppointment.id
      );
      console.log("Request data:", {
        requestedDate: values.requestedDate.format("YYYY-MM-DD"),
        requestedShift: values.requestedShift,
        notes: values.notes || "",
      });

      const response = await treatmentService.requestChangeAppointment(
        selectedAppointment.id,
        {
          requestedDate: values.requestedDate.format("YYYY-MM-DD"),
          requestedShift: values.requestedShift,
          notes: values.notes || "",
        }
      );

      console.log("Change request response:", response);

      if (response?.data?.code === 1000 || response?.status === 200) {
        showNotification("Đã gửi yêu cầu thay đổi lịch hẹn!", "success");
        setChangeModalVisible(false);
        setSelectedAppointment(null);
        changeForm.resetFields();
        // Cập nhật trực tiếp trạng thái appointment trong treatmentData
        setTreatmentData((prev) => {
          if (!prev) return prev;
          const newPhases = prev.phases.map((phase) => {
            if (
              phase.appointment &&
              phase.appointment.id === selectedAppointment.id
            ) {
              return {
                ...phase,
                appointment: {
                  ...phase.appointment,
                  status: "PENDING_CHANGE",
                  requestedDate: values.requestedDate.format("YYYY-MM-DD"),
                  requestedShift: values.requestedShift,
                  notes: values.notes || "",
                },
              };
            }
            return phase;
          });
          return { ...prev, phases: newPhases };
        });
      } else {
        showNotification(
          response?.data?.message ||
            response?.message ||
            "Không thể gửi yêu cầu.",
          "error"
        );
      }
    } catch (err) {
      console.error("Error submitting change request:", err);
      console.error("Error details:", {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        data: err?.response?.data,
        message: err?.message,
      });

      if (err?.response?.status === 404) {
        showNotification(
          "Không tìm thấy lịch hẹn với ID: " + selectedAppointment.id,
          "error"
        );
      } else if (err?.response?.status === 400) {
        showNotification(
          "Dữ liệu không hợp lệ: " +
            (err?.response?.data?.message || err?.message),
          "error"
        );
      } else {
        showNotification(
          err?.response?.data?.message ||
            err?.message ||
            "Không thể gửi yêu cầu.",
          "error"
        );
      }
    } finally {
      setChangeLoading(false);
    }
  };

  const getStatusTag = (status) => {
    switch ((status || "").toUpperCase()) {
      case "COMPLETED":
        return <Tag color="success">Hoàn thành</Tag>;
      case "INPROGRESS":
      case "IN_PROGRESS":
        return <Tag color="#1890ff">Đang thực hiện</Tag>;
      case "CONFIRMED":
        return <Tag color="#1890ff">Đã xác nhận</Tag>;
      case "PENDING":
      case "PLANNED":
        return <Tag color="orange">Đang chờ</Tag>;
      case "CANCELLED":
        return <Tag color="error">Đã hủy</Tag>;
      case "PENDING_CHANGE":
        return <Tag color="purple">Chờ duyệt đổi lịch</Tag>;
      case "REJECTED_CHANGE":
        return <Tag color="red">Từ chối đổi lịch</Tag>;
      case "REJECTED":
        return <Tag color="red">Đã từ chối</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getStepStatusTag = (status) => {
    switch (status) {
      case "COMPLETED":
        return <Tag color="success">Hoàn thành</Tag>;
      case "INPROGRESS":
      case "IN_PROGRESS":
      case "CONFIRMED":
        return <Tag color="#1890ff">Đang điều trị</Tag>;
      case "PENDING":
      case "PLANNED":
        return <Tag color="warning">Đang chờ điều trị</Tag>;
      case "CANCELLED":
        return <Tag color="error">Đã hủy</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getCurrentPhase = () => {
    if (!treatmentData?.phases) return null;

    const currentPhase = treatmentData.phases.find(
      (phase) => phase.statusRaw !== "COMPLETED"
    );

    if (currentPhase) {
      return {
        name: currentPhase.name,
        status: currentPhase.statusRaw,
        notes: currentPhase.notes || "",
      };
    }

    const lastPhase = treatmentData.phases[treatmentData.phases.length - 1];
    return {
      name: lastPhase.name,
      status: lastPhase.statusRaw,
      notes: "Đã hoàn thành",
    };
  };

  const renderPhases = () => {
    return (
      treatmentData &&
      treatmentData.phases &&
      treatmentData.phases.map((phase, idx) => ({
        key: phase.id,
        label: (
          <Space>
            <Text strong>{phase.name}</Text>
            {getStepStatusTag(phase.statusRaw)}
          </Space>
        ),
        children: (
          <div>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Trạng thái">
                {getStepStatusTag(phase.statusRaw)}
              </Descriptions.Item>
              {(idx === 0 || phase.hasDate) && (
                <Descriptions.Item label="Ngày dự kiến">
                  {phase.displayDate
                    ? dayjs(phase.displayDate).format("DD/MM/YYYY")
                    : "-"}
                </Descriptions.Item>
              )}
              {phase.endDate && (
                <Descriptions.Item label="Ngày thực hiện">
                  {dayjs(phase.endDate).format("DD/MM/YYYY")}
                </Descriptions.Item>
              )}
            </Descriptions>

            {phase.appointment && phase.statusRaw !== "COMPLETED" && (
              <div style={{ marginTop: 16 }}>
                {phase.appointment.status !== "PENDING_CHANGE" &&
                  phase.appointment.status !== "REJECTED_CHANGE" && (
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => handleOpenChangeModal(phase)}
                      style={{
                        backgroundColor: "#1890ff",
                        borderColor: "#1890ff",
                      }}
                    >
                      Gửi yêu cầu thay đổi lịch hẹn
                    </Button>
                  )}
                {phase.appointment.appointmentDate && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Lịch hẹn:</Text>
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background:
                            phase.appointment.status === "CONFIRMED"
                              ? "#1890ff"
                              : phase.appointment.status === "PENDING"
                              ? "#faad14"
                              : phase.appointment.status === "COMPLETED"
                              ? "#52c41a"
                              : phase.appointment.status === "CANCELLED"
                              ? "#ff4d4f"
                              : phase.appointment.status === "PENDING_CHANGE"
                              ? "#722ed1"
                              : phase.appointment.status === "REJECTED_CHANGE"
                              ? "#ff7875"
                              : phase.appointment.status === "REJECTED"
                              ? "#ff7875"
                              : "#d9d9d9",
                          marginRight: 4,
                        }}
                      />
                      <span style={{ fontWeight: 500 }}>{phase.name}</span>
                      {getStatusTag(phase.appointment.status)}
                      <CalendarOutlined
                        style={{ marginLeft: 8, marginRight: 4 }}
                      />
                      <span>
                        {dayjs(phase.appointment.appointmentDate).format(
                          "DD/MM/YYYY"
                        )}
                      </span>
                      {phase.appointment.shift && (
                        <span style={{ marginLeft: 8 }}>
                          - Ca:{" "}
                          {phase.appointment.shift === "MORNING"
                            ? "Sáng"
                            : "Chiều"}
                        </span>
                      )}
                      {/* Nếu có requestedDate (đang chờ duyệt đổi lịch), hiển thị thêm */}
                      {phase.appointment.status === "PENDING_CHANGE" &&
                        phase.appointment.requestedDate && (
                          <span style={{ marginLeft: 16, color: "#722ed1" }}>
                            (Yêu cầu đổi sang:{" "}
                            {dayjs(phase.appointment.requestedDate).format(
                              "DD/MM/YYYY"
                            )}{" "}
                            - Ca:{" "}
                            {phase.appointment.requestedShift === "MORNING"
                              ? "Sáng"
                              : "Chiều"}
                            )
                          </span>
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {phase.activities.length === 0 && (
              <div style={{ marginTop: 16, color: "#666" }}>
                Chưa có hoạt động được lên lịch
              </div>
            )}
          </div>
        ),
      }))
    );
  };

  const totalSteps =
    treatmentData && treatmentData.phases ? treatmentData.phases.length : 0;
  const completedSteps =
    treatmentData && treatmentData.phases
      ? treatmentData.phases.filter((phase) => phase.statusRaw === "COMPLETED")
          .length
      : 0;
  const progress =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const currentPhaseIdx =
    treatmentData && typeof treatmentData.currentPhase === "number"
      ? treatmentData.currentPhase - 1
      : -1;
  const currentPhase = getCurrentPhase();

  const handleStepClick = (phase) => {
    setSelectedPhase(phase);
    setModalOpen(true);
  };

  const getOverallStatus = (status, progress) => {
    if (status === "CANCELLED") {
      return { text: "Đã hủy", color: "error" };
    }
    if (status === "COMPLETED") {
      return { text: "Hoàn thành", color: "success" };
    }
    if (status === "INPROGRESS") {
      return { text: "Đang điều trị", color: "processing" };
    }
    if (status === "PENDING") {
      return { text: "Đang chờ điều trị", color: "warning" };
    }
    return { text: "Đang chờ điều trị", color: "warning" };
  };

  const getProgressColor = (progress) => {
    if (progress === 0) return "#faad14";
    if (progress === 100) return "#52c41a";
    return "#1890ff";
  };

  const renderTreatmentOverview = () => (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
      }}
      hoverable
      styles={{ body: { padding: "24px" } }}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Title level={4} style={{ color: "#1890ff", marginBottom: 24 }}>
            <MedicineBoxOutlined style={{ marginRight: 8 }} />
            Quá trình điều trị hiện tại
          </Title>
          <Descriptions
            column={1}
            style={{
              background: "#fafafa",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Descriptions.Item label="Gói điều trị">
              <MedicineBoxOutlined
                style={{ marginRight: 8, color: "#1890ff" }}
              />
              <Text strong>{treatmentData.type}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Bác sĩ phụ trách">
              <UserOutlined style={{ marginRight: 8, color: "#1890ff" }} />
              <Text strong>{treatmentData.doctor}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
              <CalendarOutlined style={{ marginRight: 8, color: "#1890ff" }} />
              {dayjs(treatmentData.startDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(treatmentData.status)}
            </Descriptions.Item>
          </Descriptions>
        </Col>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 24 }}>
            <Title level={5} style={{ color: "#1890ff", marginBottom: 16 }}>
              <CheckIcon style={{ marginRight: 8 }} />
              Tiến độ tổng thể
            </Title>
            <Progress
              percent={progress}
              status="active"
              strokeColor={{
                from: getProgressColor(progress),
                to: getProgressColor(progress),
              }}
              size={12}
              style={{ marginBottom: 8 }}
            />
            <Text type="secondary" style={{ fontSize: "14px" }}>
              {progress}% hoàn thành
            </Text>
          </div>
          <div>
            <Title level={5} style={{ color: "#1890ff", marginBottom: 16 }}>
              <HeartOutlined style={{ marginRight: 8 }} />
              Giai đoạn hiện tại
            </Title>
            <div
              style={{
                background: "linear-gradient(135deg, #e6f7ff 0%, #f0f7ff 100%)",
                padding: 20,
                borderRadius: 12,
                border: "1px solid #91d5ff",
                transition: "all 0.3s ease",
              }}
            >
              <Space align="baseline">
                <HeartOutlined style={{ fontSize: 28, color: "#1890ff" }} />
                <div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#1890ff",
                    }}
                  >
                    {currentPhase ? currentPhase.name : "Thăm khám ban đầu"}
                  </div>
                  <div style={{ color: "#666", marginTop: 4 }}>
                    {currentPhase
                      ? currentPhase.notes
                      : "Chuẩn bị thăm khám ban đầu"}
                  </div>
                </div>
              </Space>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );

  const renderTreatmentProgress = () => (
    <Card
      title={
        <Space>
          <DeploymentUnitOutlined
            style={{ color: "#1890ff", fontSize: "20px" }}
          />
          <span>Tiến trình điều trị</span>
        </Space>
      }
      style={{
        marginBottom: 24,
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
      }}
      hoverable
    >
      <Collapse
        defaultActiveKey={["0"]}
        style={{ background: "transparent" }}
        expandIconPosition="end"
        items={renderPhases()}
      />
    </Card>
  );

  const columns = [
    {
      title: "Gói điều trị",
      dataIndex: "serviceName",
      key: "serviceName",
      render: (text) => (
        <Space>
          <MedicineBoxOutlined style={{ color: "#1890ff" }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Bác sĩ phụ trách",
      dataIndex: "doctorName",
      key: "doctorName",
      render: (text) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format("DD/MM/YYYY")}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Tiến độ",
      dataIndex: "progress",
      key: "progress",
      render: (progress) => (
        <Progress
          percent={progress}
          size="small"
          status={progress === 100 ? "success" : "active"}
        />
      ),
    },
    {
      title: "Chi tiết dịch vụ",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<RightOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const handleViewDetail = async (record) => {
    try {
      setLoading(true);

      // Lấy chi tiết treatment record bằng API mới
      const detailResponse = await treatmentService.getTreatmentRecordById(
        record.id
      );
      const detailData = detailResponse?.data?.result;

      if (!detailData) {
        message.error("Không tìm thấy thông tin chi tiết điều trị");
        return;
      }

      // Format dữ liệu để hiển thị
      const treatmentSteps = detailData.treatmentSteps || [];
      const totalSteps = treatmentSteps.length;
      const completedSteps = treatmentSteps.filter(
        (step) => step.status === "COMPLETED"
      ).length;
      const overallProgress =
        totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

      // Lấy appointments cho từng step
      const stepsWithAppointments = await Promise.all(
        treatmentSteps.map(async (step) => {
          try {
            const appointmentsResponse = await treatmentService.getAppointments(
              {
                stepId: step.id,
                customerId: detailData.customerId,
                page: 0,
                size: 10,
              }
            );
            const appointments =
              appointmentsResponse?.data?.result?.content || [];
            return {
              ...step,
              appointments: appointments,
            };
          } catch (error) {
            console.warn(
              `Không thể lấy appointments cho step ${step.id}:`,
              error
            );
            return {
              ...step,
              appointments: [],
            };
          }
        })
      );

      setTreatmentData({
        id: detailData.id,
        type: detailData.treatmentServiceName || detailData.serviceName,
        startDate: detailData.startDate,
        currentPhase:
          treatmentSteps.findIndex((step) => step.status !== "COMPLETED") + 1 ||
          1,
        doctor: detailData.doctorName,
        status: detailData.status,
        estimatedCompletion:
          detailData.endDate ||
          dayjs(detailData.startDate).add(45, "days").format("YYYY-MM-DD"),
        nextAppointment: null,
        overallProgress: overallProgress,
        customerId: detailData.customerId,
        phases: stepsWithAppointments.map((step, index) => ({
          id: step.id,
          name: step.name,
          statusRaw: step.status,
          status: step.status,
          displayDate: step.scheduledDate || null,
          hasDate: !!step.scheduledDate,
          startDate: step.scheduledDate,
          endDate: step.actualDate,
          notes: step.notes || "",
          appointment: step.appointments[0] || null, // Lấy appointment đầu tiên
          activities: [
            {
              name: step.name,
              date: step.scheduledDate,
              status: step.status,
              notes: step.notes || "",
            },
          ],
        })),
      });

      setViewMode("detail");
      setSelectedPhase(null);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết điều trị:", error);
      message.error("Không thể lấy thông tin chi tiết điều trị");
    } finally {
      setLoading(false);
    }
  };

  const renderListView = () => (
    <div style={{ padding: "24px" }}>
      <Card>
        <Title level={3}>
          <Space>
            <MedicineBoxOutlined />
            Tiến trình điều trị
          </Space>
        </Title>
        <Table
          columns={columns}
          dataSource={treatments}
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  if (viewMode === "list") {
    return renderListView();
  }

  if (!treatmentData || !treatmentData.phases) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Text type="secondary">Không có thông tin điều trị</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          background: "white",
          padding: "16px 24px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              setViewMode("list");
              setTreatmentData(null); // dọn data chi tiết
            }}
            style={{ border: "none", boxShadow: "none" }}
          />
          <Title level={4} style={{ margin: 0 }}>
            Tiến độ điều trị
          </Title>
        </div>
      </div>

      {renderTreatmentOverview()}
      {renderTreatmentProgress()}

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        title={selectedPhase ? selectedPhase.name : ""}
        destroyOnHidden
      >
        {selectedPhase && (
          <div>
            <p>
              <b>Trạng thái:</b> {getStepStatusTag(selectedPhase.statusRaw)}
            </p>
            {selectedPhase.displayDate && (
              <p>
                <b>Ngày dự kiến:</b>{" "}
                {dayjs(selectedPhase.displayDate).format("DD/MM/YYYY")}
              </p>
            )}
            {selectedPhase.endDate && (
              <p>
                <b>Ngày thực hiện:</b>{" "}
                {dayjs(selectedPhase.endDate).format("DD/MM/YYYY")}
              </p>
            )}
            {selectedPhase.notes && (
              <p>
                <b>Ghi chú:</b> {selectedPhase.notes}
              </p>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={`Gửi yêu cầu thay đổi lịch hẹn: ${changeStep?.name || ""}`}
        open={changeModalVisible}
        onCancel={() => {
          setChangeModalVisible(false);
          setSelectedAppointment(null);
          changeForm.resetFields();
        }}
        onOk={handleSubmitChange}
        okText="Gửi yêu cầu"
        confirmLoading={changeLoading}
        destroyOnHidden
        width={800}
      >
        {changeLoading ? (
          <Spin />
        ) : changeAppointment && Array.isArray(changeAppointment) ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Chọn lịch hẹn muốn thay đổi:</Text>
            </div>
            <Table
              dataSource={changeAppointment}
              columns={[
                {
                  title: "Ngày hẹn",
                  dataIndex: "appointmentDate",
                  key: "appointmentDate",
                  render: (date) => dayjs(date).format("DD/MM/YYYY"),
                },
                {
                  title: "Ca khám",
                  dataIndex: "shift",
                  key: "shift",
                  render: (shift) => (shift === "MORNING" ? "Sáng" : "Chiều"),
                },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  key: "status",
                  render: (status) => {
                    switch ((status || "").toUpperCase()) {
                      case "CONFIRMED":
                        return <Tag color="#1890ff">Đã xác nhận</Tag>;
                      case "PENDING":
                        return <Tag color="orange">Đang chờ</Tag>;
                      case "PENDING_CHANGE":
                        return <Tag color="purple">Chờ duyệt đổi lịch</Tag>;
                      case "REJECTED_CHANGE":
                        return <Tag color="red">Từ chối đổi lịch</Tag>;
                      case "REJECTED":
                        return <Tag color="red">Đã từ chối</Tag>;
                      case "COMPLETED":
                        return <Tag color="green">Đã hoàn thành</Tag>;
                      case "CANCELLED":
                        return <Tag color="error">Đã hủy</Tag>;
                      case "INPROGRESS":
                        return <Tag color="#1890ff">Đang thực hiện</Tag>;
                      default:
                        return <Tag color="default">{status}</Tag>;
                    }
                  },
                },
                {
                  title: "Ghi chú",
                  dataIndex: "notes",
                  key: "notes",
                  render: (notes) => notes || "-",
                },
                {
                  title: "Chọn",
                  key: "select",
                  render: (_, record) => (
                    <Button
                      type={
                        selectedAppointment?.id === record.id
                          ? "primary"
                          : "default"
                      }
                      size="small"
                      onClick={() => {
                        setSelectedAppointment(record);
                        changeForm.setFieldsValue({
                          requestedDate: record.appointmentDate
                            ? dayjs(record.appointmentDate)
                            : null,
                          requestedShift: record.shift || undefined,
                          notes: record.notes || "",
                        });
                      }}
                    >
                      {selectedAppointment?.id === record.id
                        ? "Đã chọn"
                        : "Chọn"}
                    </Button>
                  ),
                },
              ]}
              pagination={false}
              size="small"
              rowKey="id"
            />

            {selectedAppointment && (
              <div style={{ marginTop: 16 }}>
                <Divider />
                <Text strong>Thông tin lịch hẹn mới:</Text>
                <Form
                  form={changeForm}
                  layout="vertical"
                  style={{ marginTop: 16 }}
                >
                  <Form.Item
                    label="Ngày hẹn mới"
                    name="requestedDate"
                    rules={[{ required: true, message: "Chọn ngày mới" }]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    label="Ca khám mới"
                    name="requestedShift"
                    rules={[{ required: true, message: "Chọn ca khám" }]}
                  >
                    <Select placeholder="Chọn ca">
                      <Option value="MORNING">Sáng</Option>
                      <Option value="AFTERNOON">Chiều</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Ghi chú" name="notes">
                    <Input.TextArea
                      rows={2}
                      placeholder="Ghi chú thêm (nếu có)"
                    />
                  </Form.Item>
                </Form>
              </div>
            )}
          </div>
        ) : (
          <Alert
            type="warning"
            message="Không tìm thấy lịch hẹn tương ứng cho bước này!"
          />
        )}
      </Modal>
    </div>
  );
};

export default TreatmentProgress;
