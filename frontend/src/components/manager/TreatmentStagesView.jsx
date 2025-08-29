import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  Modal,
} from "antd";
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
  SwapOutlined,
} from "@ant-design/icons";
import { treatmentService } from "../../service/treatment.service";
import dayjs from "dayjs";
import { NotificationContext } from "../../App";

const { Title, Text } = Typography;

const TreatmentStagesView = () => {
  console.log("🚀 TreatmentStagesView component loaded");

  // ===== NAVIGATION & CONTEXT =====
  const location = useLocation();                                            // Hook để lấy location state
  const navigate = useNavigate();                                            // Hook điều hướng
  const { showNotification } = useContext(NotificationContext);              // Context hiển thị thông báo

  // ===== LAB TEST HANDLERS (READ-ONLY FOR MANAGER) =====
  // Hàm xem lab tests của step (chỉ đọc)
  const handleShowLabTestModal = async (step) => {
    setLabTestStep(step);
    setShowLabTestModal(true);
    setLoadingLabTests(true);
    
    try {
      const response = await treatmentService.getLabTestsByStepId(step.id);
      const tests = response?.data?.result || [];
      setLabTests(tests);
    } catch (error) {
      console.error("❌ Error fetching lab tests:", error);
      setLabTests([]);
      showNotification("Không thể tải danh sách xét nghiệm", "error");
    } finally {
      setLoadingLabTests(false);
    }
  };

  // ===== STATE MANAGEMENT =====
  // State quản lý data
  const [loading, setLoading] = useState(true);                              // Loading state chính
  const [treatmentData, setTreatmentData] = useState(null);                  // Data treatment record chi tiết
  const [stepAppointments, setStepAppointments] = useState({});              // Appointments cho từng step
  const [loadingAppointments, setLoadingAppointments] = useState(false);     // Loading state cho appointments

  // State quản lý modal và UI
  const [showScheduleModal, setShowScheduleModal] = useState(false);         // Modal lên lịch appointment
  const [scheduleStep, setScheduleStep] = useState(null);                    // Step được chọn để lên lịch
  const [showAllAppointments, setShowAllAppointments] = useState(false);     // Flag hiển thị tất cả appointments

  // State quản lý Lab Tests (read-only for manager)
  const [showLabTestModal, setShowLabTestModal] = useState(false);           // Modal xem lab tests
  const [labTestStep, setLabTestStep] = useState(null);                      // Step được chọn để xem lab tests
  const [labTests, setLabTests] = useState([]);                              // Danh sách lab tests
  const [loadingLabTests, setLoadingLabTests] = useState(false);             // Loading lab tests

  // ===== USEEFFECT: DEBUG LOG TREATMENT DATA =====
  // useEffect để debug log khi treatmentData thay đổi
  useEffect(() => {
    console.log("🔄 TreatmentData state changed:", treatmentData);
    console.log("🔄 Has treatmentSteps?", !!treatmentData?.treatmentSteps);
    console.log("🔄 Steps count:", treatmentData?.treatmentSteps?.length || 0);
    console.log("🔄 Steps data:", treatmentData?.treatmentSteps);
  }, [treatmentData]);

  // ===== USEEFFECT: FETCH TREATMENT DATA =====
  // useEffect này chạy khi component mount để lấy treatment data
  useEffect(() => {
    const fetchData = async () => {
      console.log("🚀 Starting to fetch treatment data...");

      try {
        // Lấy data từ location state (từ ManagerTreatmentRecords)
        const { patientInfo, treatmentData: passedTreatmentData } =
          location.state || {};
        
        // Validate patientInfo required
        if (!patientInfo) {
          showNotification("Không tìm thấy thông tin bệnh nhân", "warning");
          navigate(-1);                                                       // Go back
          return;
        }

        console.log("📋 Received data from ManagerTreatmentRecords:", {
          patientInfo,
          treatmentData: passedTreatmentData,
        });

        // Nếu đã có treatmentData với ID thì xử lý
        if (passedTreatmentData && passedTreatmentData.id) {
          console.log(
            "✅ Using treatmentData from ManagerTreatmentRecords:",
            passedTreatmentData.id
          );

          // Nếu đã có steps thì dùng luôn
          if (
            passedTreatmentData.treatmentSteps &&
            passedTreatmentData.treatmentSteps.length > 0
          ) {
            console.log("✅ TreatmentData already has steps, using directly");
            setTreatmentData(passedTreatmentData);                            // Set treatment data
            setLoading(false);
            return;
          } else {
            // Gọi API lấy chi tiết để có steps
            console.log(
              "⚠️ TreatmentData missing steps, calling API to get details..."
            );
            try {
              const detailedResponse =
                await treatmentService.getTreatmentRecordById(
                  passedTreatmentData.id
                );                                                            // Gọi API lấy chi tiết
              const detailedData = detailedResponse?.data?.result;
              if (detailedData) {
                console.log("✅ Got detailed treatment data with steps");
                setTreatmentData(detailedData);                               // Set detailed data
                setLoading(false);
                return;
              }
            } catch (apiError) {
              console.warn(
                "API call failed, using passed treatmentData:",
                apiError
              );
            }

            // Fallback: sử dụng data được pass mà không có steps
            console.log("⚠️ Using passed treatmentData without steps");
            setTreatmentData(passedTreatmentData);                            // Fallback data
            setLoading(false);
            return;
          }
        }

        // Nếu không có treatmentData từ ManagerTreatmentRecords, báo lỗi
        console.log(
          "❌ No treatmentData received from ManagerTreatmentRecords"
        );
        showNotification(
          "Không nhận được dữ liệu điều trị từ danh sách hồ sơ",
          "error"
        );
        navigate(-1);                                                         // Go back
      } catch (error) {
        console.error("❌ Error fetching treatment data:", error);
        showNotification("Không thể lấy thông tin điều trị", "error");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ===== UTILITY FUNCTION: STATUS COLOR MAPPING =====
  // Hàm lấy màu sắc cho status
  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "processing";
      case "INPROGRESS":
        return "processing";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "error";
      case "PENDING":
      default:
        return "warning";
    }
  };

  // ===== UTILITY FUNCTION: STATUS TEXT MAPPING =====
  // Hàm lấy text hiển thị cho status
  const getStatusText = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "PENDING":
        return "Đang chờ xử lý";
      case "PLANED":
        return "Đã lên lịch";
      case "COMPLETED":
        return "Đã hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "INPROGRESS":
        return "Đang điều trị";
      default:
        return status;
    }
  };

  // ===== UTILITY FUNCTION: RESULT TEXT MAPPING =====
  // Hàm lấy text hiển thị cho result
  const getResultText = (result) => {
    switch (result) {
      case "SUCCESS":
        return "Thành công";
      case "FAILURE":
        return "Thất bại";
      case "UNDETERMINED":
        return "Chưa xác định";
      default:
        return "Chưa có kết quả";
    }
  };

  // ===== UTILITY FUNCTION: CALCULATE PROGRESS =====
  // Hàm tính tỉ lệ tiến trình hoàn thành
  const calculateProgress = () => {
    if (!treatmentData?.treatmentSteps) return 0;
    const completedSteps = treatmentData.treatmentSteps.filter(
      (step) => step.status === "COMPLETED"
    ).length;
    return Math.round(
      (completedSteps / treatmentData.treatmentSteps.length) * 100            // Tính % hoàn thành
    );
  };

  // ===== UTILITY FUNCTION: APPOINTMENT STATUS COLOR MAPPING =====
  // Hàm lấy màu sắc cho trạng thái appointment
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
      case "PLANED":
        return "yellow";
      case "INPROGRESS":
        return "orange";
      case "PENDING_CHANGE":
        return "gold";
      case "REJECTED":
        return "volcano";
      default:
        return "default";
    }
  };

  // ===== UTILITY FUNCTION: APPOINTMENT STATUS TEXT MAPPING =====
  // Hàm lấy text hiển thị cho trạng thái appointment
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
      case "PLANED":
        return "Đã lên lịch";
      case "INPROGRESS":
        return "Đang điều trị";
      case "PENDING_CHANGE":
        return "Chờ duyệt đổi lịch";
      case "REJECTED":
        return "Từ chối yêu cầu đổi lịch";
      default:
        return status;
    }
  };

  // ===== UTILITY FUNCTION: GET STATUS ICON =====
  // Hàm lấy icon cho status
  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "CONFIRMED":
        return <ClockCircleOutlined style={{ color: "#1890ff" }} />;
      case "CANCELLED":
        return <CloseOutlined style={{ color: "#ff4d4f" }} />;
      case "INPROGRESS":
        return <ClockCircleOutlined style={{ color: "#fa8c16" }} />;
      case "REJECTED":
        return <CloseOutlined style={{ color: "#ff4d4f" }} />;
      case "PLANNED":
      default:
        return <ClockCircleOutlined style={{ color: "#d9d9d9" }} />;
    }
  };

  // ===== HANDLER: SHOW SCHEDULE MODAL =====
  // Hàm mở modal xem lịch hẹn của bước điều trị
  const handleShowScheduleModal = async (step) => {
    setScheduleStep(step);                                                    // Set step được chọn
    setShowScheduleModal(true);                                               // Mở modal
    setShowAllAppointments(false);                                            // Reset về hiển thị 3 lịch hẹn đầu
    setLoadingAppointments(true);                                             // Start loading
    
    try {
      const response = await treatmentService.getAppointmentsByStepId(step.id); // Gọi API lấy appointments
      
      // Lấy đúng mảng appointments (handle different response formats)
      let appointments = [];
      if (response?.data?.result?.content) {
        appointments = response.data.result.content;                          // Paginated response
      } else if (Array.isArray(response?.data?.result)) {
        appointments = response.data.result;                                  // Direct array response
      } else if (Array.isArray(response)) {
        appointments = response;                                              // Direct array
      }
      
      setStepAppointments((prev) => ({ ...prev, [step.id]: appointments })); // Set appointments cho step
    } catch (error) {
      setStepAppointments((prev) => ({ ...prev, [step.id]: [] }));           // Set empty array on error
    } finally {
      setLoadingAppointments(false);                                          // End loading
    }
  };

  // ===== DEBUG: EXTRACT STEP INFO =====
  // Lấy tên các bước điều trị cho debug
  const stepNames =
    treatmentData?.treatmentSteps?.map(
      (step) => step.stageName || step.name || ""
    ) || [];
    
  // Lấy tên, số thứ tự và trạng thái của từng bước điều trị cho debug
  const stepLogs = (treatmentData?.treatmentSteps || []).map((step, idx) => {
    const name = step.stageName || step.name || "";
    const status = getStatusText ? getStatusText(step.status) : step.status;
    return `Bước ${idx + 1}: ${name} - ${status}`;
  });
  console.log("Các bước điều trị:", stepLogs);

  // ===== LOADING STATE =====
  // Render loading spinner khi đang tải dữ liệu
  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  // ===== EMPTY STATE =====
  // Render empty state khi không có dữ liệu
  if (!treatmentData) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Text>Không tìm thấy thông tin điều trị</Text>
      </div>
    );
  }

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div style={{ padding: "24px" }}>
      {/* ===== MAIN CONTAINER CARD ===== */}
      <Card>
        {/* ===== BACK BUTTON SECTION ===== */}
        {/* Nút quay lại trang trước */}
        <div style={{ marginBottom: 24 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}                                     // Go back
            style={{ marginBottom: 16 }}
          >
            Quay lại
          </Button>
        </div>

        {/* ===== PATIENT INFORMATION CARD ===== */}
        {/* Card hiển thị thông tin bệnh nhân và treatment */}
        <Card
          title={null}
          style={{
            marginBottom: 32,
            borderRadius: 18,
            boxShadow: "0 4px 16px rgba(24,144,255,0.08)",
            background: "#fafdff",
          }}
          size="small"
          bodyStyle={{ padding: 32 }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={24}>
              <Row gutter={[16, 16]}>
                {/* Patient name */}
                <Col xs={24} md={12}>
                  <Space>
                    <Text strong style={{ fontSize: 16 }}>
                      Tên bệnh nhân:
                    </Text>
                    <Text style={{ fontSize: 16 }}>
                      {treatmentData.customerName}
                    </Text>
                  </Space>
                </Col>
                
                {/* Doctor name */}
                <Col xs={24} md={12}>
                  <Space>
                    <Text strong>Bác sĩ:</Text>
                    <Text>{treatmentData.doctorName}</Text>
                  </Space>
                </Col>
                
                {/* Treatment service */}
                <Col xs={24} md={12}>
                  <Space>
                    <Text strong>Dịch vụ:</Text>
                    <Text>{treatmentData.treatmentServiceName}</Text>
                  </Space>
                </Col>
                
                {/* CD1 date */}
                <Col xs={24} md={12}>
                  <Space>
                    <Text strong>Ngày đầu chu kì:</Text>
                    <Text>
                      {dayjs(treatmentData.cd1Date).format("DD/MM/YYYY")}
                    </Text>
                  </Space>
                </Col>
                
                {/* Start date */}
                <Col xs={24} md={12}>
                  <Space>
                    <Text strong>Ngày bắt đầu:</Text>
                    <Text>
                      {dayjs(treatmentData.startDate).format("DD/MM/YYYY")}
                    </Text>
                  </Space>
                </Col>

                {/* Treatment status */}
                <Col xs={24} md={12}>
                  <Space>
                    <Text strong>Trạng thái:</Text>
                    <Tag
                      color={getStatusColor(treatmentData.status)}
                      style={{ fontSize: 15, padding: "4px 16px" }}
                    >
                      {getStatusText(treatmentData.status)}
                    </Tag>
                  </Space>
                </Col>
                
                {/* Treatment result */}
                <Col xs={24} md={12}>
                  <Space>
                    <Text strong>Kết quả:</Text>
                    <Tag
                      color={
                        treatmentData.result === "SUCCESS"
                          ? "green"
                          : treatmentData.result === "FAILURE"
                          ? "red"
                          : treatmentData.result === "UNDETERMINED"
                          ? "orange"
                          : "default"
                      }
                      style={{ fontSize: 15, padding: "4px 16px" }}
                    >
                      {getResultText(treatmentData.result)}
                    </Tag>
                  </Space>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        {/* ===== TREATMENT STEPS TIMELINE SECTION ===== */}
        {/* Timeline hiển thị các bước điều trị */}
        {treatmentData.treatmentSteps &&
        treatmentData.treatmentSteps.length > 0 ? (
          <Card
            title={
              <span style={{ fontWeight: 700, fontSize: 20, color: "#1890ff" }}>
                Các bước điều trị
              </span>
            }
            style={{
              marginBottom: 32,
              borderRadius: 18,
              boxShadow: "0 4px 16px rgba(24,144,255,0.08)",
              background: "#fff",
            }}
            bodyStyle={{ padding: 32 }}
          >
            <Timeline style={{ marginLeft: 16 }}>
              {treatmentData.treatmentSteps.map((step, index) => (
                <Timeline.Item
                  key={step.id}
                  color={getStatusColor(step.status)}
                  dot={
                    // Custom timeline dot với số thứ tự
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background:
                          getStatusColor(step.status) === "success"
                            ? "#e6fffb"
                            : getStatusColor(step.status) === "error"
                            ? "#fff1f0"
                            : getStatusColor(step.status) === "processing"
                            ? "#e6f7ff"
                            : getStatusColor(step.status) === "orange"
                            ? "#fff7e6"
                            : "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `3px solid ${
                          getStatusColor(step.status) === "success"
                            ? "#52c41a"
                            : getStatusColor(step.status) === "error"
                            ? "#ff4d4f"
                            : getStatusColor(step.status) === "processing"
                            ? "#1890ff"
                            : getStatusColor(step.status) === "orange"
                            ? "#fa8c16"
                            : "#d9d9d9"
                        }`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 22,
                          color:
                            getStatusColor(step.status) === "success"
                              ? "#52c41a"
                              : getStatusColor(step.status) === "error"
                              ? "#ff4d4f"
                              : getStatusColor(step.status) === "processing"
                              ? "#1890ff"
                              : getStatusColor(step.status) === "orange"
                              ? "#fa8c16"
                              : "#bfbfbf",
                          fontWeight: 700,
                        }}
                      >
                        {index + 1}                                           {/* Số thứ tự bước */}
                      </span>
                    </div>
                  }
                >
                  {/* ===== STEP DETAIL CARD ===== */}
                  {/* Card chi tiết cho từng bước điều trị */}
                  <Card
                    size="small"
                    style={{
                      marginBottom: 24,
                      borderRadius: 16,
                      boxShadow: "0 2px 8px rgba(24,144,255,0.08)",
                      background: index === 0 ? "#fafdff" : "#fff",             // Highlight first step
                      transition: "box-shadow 0.2s",
                      border: `1.5px solid ${
                        getStatusColor(step.status) === "success"
                          ? "#52c41a"
                          : getStatusColor(step.status) === "error"
                          ? "#ff4d4f"
                          : getStatusColor(step.status) === "processing"
                          ? "#1890ff"
                          : getStatusColor(step.status) === "orange"
                          ? "#fa8c16"
                          : "#d9d9d9"
                      }`,
                    }}
                    bodyStyle={{ padding: 24 }}
                    hoverable
                  >
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={24} md={16}>
                        {/* Step title and status */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 8,
                          }}
                        >
                          <Text
                            strong
                            style={{ fontSize: 18, color: "#1890ff" }}
                          >
                            Bước {index + 1}:{" "}
                            {step.stageName || step.name || ""}
                          </Text>
                          <Tag
                            color={getStatusColor(step.status)}
                            style={{ fontSize: 15, padding: "4px 16px" }}
                          >
                            {getStatusText(step.status)}
                          </Tag>
                        </div>
                        
                        {/* Step details */}
                        <Descriptions
                          column={2}
                          size="small"
                          style={{ background: "transparent" }}
                        >
                          <Descriptions.Item label="Ngày bắt đầu">
                            {step.startDate
                              ? dayjs(step.startDate).format("DD/MM/YYYY")
                              : "Chưa có lịch"}
                          </Descriptions.Item>
                          <Descriptions.Item label="Ngày kết thúc">
                            {step.endDate
                              ? dayjs(step.endDate).format("DD/MM/YYYY")
                              : "Chưa thực hiện"}
                          </Descriptions.Item>
                          <Descriptions.Item label="Ghi chú">
                            {step.notes || "Không có ghi chú"}
                          </Descriptions.Item>
                        </Descriptions>
                      </Col>
                      <Col xs={24} md={8} style={{ textAlign: "right" }}>
                        <Space direction="vertical" size="small">
                          <Button
                            type="primary"
                            ghost
                            icon={<FileTextOutlined />}
                            style={{
                              borderRadius: 8,
                              fontWeight: 600,
                              minWidth: 140,
                              marginTop: 8,
                            }}
                            onClick={() => handleShowScheduleModal(step)}
                          >
                            Xem lịch hẹn
                          </Button>
                          <Button
                            type="default"
                            icon={<ExperimentOutlined />}
                            style={{
                              borderRadius: 8,
                              fontWeight: 600,
                              minWidth: 140,
                              background: "#e6f7ff",
                              borderColor: "#1890ff",
                              color: "#1890ff",
                            }}
                            onClick={() => handleShowLabTestModal(step)}
                          >
                            Xét nghiệm
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        ) : (
          <Card
            title="Các bước điều trị"
            style={{
              marginBottom: 24,
              borderRadius: 18,
              boxShadow: "0 4px 16px rgba(24,144,255,0.08)",
              background: "#fff",
            }}
          >
            <Text type="secondary">Chưa có bước điều trị nào được tạo</Text>
          </Card>
        )}
      </Card>

      {/* Modal xem lịch hẹn của bước điều trị */}
      <Modal
        title={
          <div style={{ textAlign: "center" }}>Lịch hẹn của bước điều trị</div>
        }
        open={showScheduleModal}
        onCancel={() => {
          setShowScheduleModal(false);
          setScheduleStep(null);
        }}
        footer={null}
        width={700}
        centered
      >
        <div style={{ marginTop: 0, borderTop: "none", paddingTop: 0 }}>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 16 }}>
            Các lần hẹn đã đăng ký cho bước này:
          </div>
          {loadingAppointments ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <Spin size="large" />
            </div>
          ) : !stepAppointments[scheduleStep?.id] ||
            stepAppointments[scheduleStep?.id].length === 0 ? (
            <div
              style={{
                color: "#888",
                textAlign: "center",
                padding: 20,
                background: "#f5f5f5",
                borderRadius: 8,
              }}
            >
              Chưa có lịch hẹn nào cho bước này.
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  justifyContent: "center",
                }}
              >
                {stepAppointments[scheduleStep?.id]
                  ?.slice(0, 3)
                  .map((appointment, idx) => {
                    const statusColor = getAppointmentStatusColor(
                      appointment.status
                    );
                    const statusIcon = (() => {
                      switch (appointment.status) {
                        case "COMPLETED":
                          return (
                            <CheckCircleOutlined style={{ color: "#52c41a" }} />
                          );
                        case "CONFIRMED":
                          return (
                            <ClockCircleOutlined style={{ color: "#1890ff" }} />
                          );
                        case "CANCELLED":
                          return <CloseOutlined style={{ color: "#ff4d4f" }} />;
                        case "PENDING":
                          return (
                            <ExclamationCircleOutlined
                              style={{ color: "#faad14" }}
                            />
                          );
                        case "PENDING_CHANGE":
                          return <SwapOutlined style={{ color: "#faad14" }} />;
                        default:
                          return (
                            <ClockCircleOutlined style={{ color: "#d9d9d9" }} />
                          );
                      }
                    })();
                    return (
                      <Card
                        key={appointment.id}
                        size="small"
                        style={{
                          width: 200,
                          border: `2px solid ${
                            statusColor === "default" ? "#d9d9d9" : statusColor
                          }`,
                          borderRadius: 14,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                          position: "relative",
                          marginBottom: 8,
                          background: "#fff",
                          minHeight: 180,
                        }}
                        bodyStyle={{ padding: 16 }}
                      >
                        <div
                          style={{ position: "absolute", top: 10, right: 10 }}
                        >
                          {statusIcon}
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>Ngày hẹn:</Text>
                          <br />
                          <Text>
                            {dayjs(appointment.appointmentDate).format(
                              "DD/MM/YYYY"
                            )}
                          </Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>Ca khám:</Text>
                          <br />
                          <Tag color="cyan">
                            {appointment.shift === "MORNING"
                              ? "Sáng"
                              : appointment.shift === "AFTERNOON"
                              ? "Chiều"
                              : appointment.shift}
                          </Tag>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>Trạng thái:</Text>
                          <br />
                          <Tag color={statusColor}>
                            {getAppointmentStatusText(appointment.status)}
                          </Tag>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>Ghi chú:</Text>
                          <br />
                          <Text
                            style={{
                              maxWidth: "100%",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                              display: "inline-block",
                              verticalAlign: "top",
                            }}
                            title={appointment.notes} // tooltip đầy đủ khi hover
                          >
                            {appointment.notes || "Không có ghi chú"}
                          </Text>
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

              {/* Hiển thị thêm các lịch hẹn còn lại khi đã click "Xem thêm" */}
              {showAllAppointments &&
                stepAppointments[scheduleStep?.id]?.length > 3 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 16,
                      justifyContent: "center",
                      marginTop: 16,
                    }}
                  >
                    {stepAppointments[scheduleStep?.id]
                      ?.slice(3)
                      .map((appointment, idx) => {
                        const statusColor = getAppointmentStatusColor(
                          appointment.status
                        );
                        const statusIcon = (() => {
                          switch (appointment.status) {
                            case "COMPLETED":
                              return (
                                <CheckCircleOutlined
                                  style={{ color: "#52c41a" }}
                                />
                              );
                            case "CONFIRMED":
                              return (
                                <ClockCircleOutlined
                                  style={{ color: "#1890ff" }}
                                />
                              );
                            case "CANCELLED":
                              return (
                                <CloseOutlined style={{ color: "#ff4d4f" }} />
                              );
                            case "PENDING":
                              return (
                                <ExclamationCircleOutlined
                                  style={{ color: "#faad14" }}
                                />
                              );
                            case "PENDING_CHANGE":
                              return (
                                <SwapOutlined style={{ color: "#faad14" }} />
                              );
                            default:
                              return (
                                <ClockCircleOutlined
                                  style={{ color: "#d9d9d9" }}
                                />
                              );
                          }
                        })();
                        return (
                          <Card
                            key={appointment.id}
                            size="small"
                            style={{
                              width: 200,
                              border: `2px solid ${
                                statusColor === "default"
                                  ? "#d9d9d9"
                                  : statusColor
                              }`,
                              borderRadius: 14,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                              position: "relative",
                              marginBottom: 8,
                              background: "#fff",
                              minHeight: 180,
                            }}
                            bodyStyle={{ padding: 16 }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                              }}
                            >
                              {statusIcon}
                            </div>
                            <div style={{ marginBottom: 8 }}>
                              <Text strong>Ngày hẹn:</Text>
                              <br />
                              <Text>
                                {dayjs(appointment.appointmentDate).format(
                                  "DD/MM/YYYY"
                                )}
                              </Text>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                              <Text strong>Ca khám:</Text>
                              <br />
                              <Tag color="cyan">
                                {appointment.shift === "MORNING"
                                  ? "Sáng"
                                  : appointment.shift === "AFTERNOON"
                                  ? "Chiều"
                                  : appointment.shift}
                              </Tag>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                              <Text strong>Trạng thái:</Text>
                              <br />
                              <Tag color={statusColor}>
                                {getAppointmentStatusText(appointment.status)}
                              </Tag>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                              <Text strong>Ghi chú:</Text>
                              <br />
                              <Text
                                style={{
                                  maxWidth: "100%",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                  display: "inline-block",
                                  verticalAlign: "top",
                                }}
                                title={appointment.notes} // tooltip đầy đủ khi hover
                              >
                                {appointment.notes || "Không có ghi chú"}
                              </Text>
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

              {/* Nút "Xem thêm" hoặc "Ẩn bớt" ở cuối */}
              {stepAppointments[scheduleStep?.id]?.length > 3 && (
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  {showAllAppointments ? (
                    <Button
                      type="default"
                      icon={<FileTextOutlined />}
                      onClick={() => setShowAllAppointments(false)}
                      style={{ borderRadius: 8, minWidth: 140 }}
                    >
                      Ẩn bớt
                    </Button>
                  ) : (
                    <Button
                      type="default"
                      icon={<FileTextOutlined />}
                      onClick={() => setShowAllAppointments(true)}
                      style={{ borderRadius: 8, minWidth: 140 }}
                    >
                      Xem thêm ({stepAppointments[scheduleStep?.id]?.length - 3}
                      )
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* ===== LAB TESTS MODAL (READ-ONLY FOR MANAGER) ===== */}
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            <ExperimentOutlined
              style={{ fontSize: 24, color: "#1890ff", marginRight: 8 }}
            />
            Kết quả xét nghiệm
          </div>
        }
        open={showLabTestModal}
        onCancel={() => {
          setShowLabTestModal(false);
          setLabTestStep(null);
          setLabTests([]);
        }}
        footer={null}
        width={700}
        centered
      >
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 16 }}>
            Danh sách xét nghiệm cho bước: {labTestStep?.stageName || labTestStep?.name}
          </div>
          
          {loadingLabTests ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <Spin size="large" />
            </div>
          ) : labTests.length === 0 ? (
            <div
              style={{
                color: "#888",
                textAlign: "center",
                padding: 20,
                background: "#f5f5f5",
                borderRadius: 8,
              }}
            >
              Chưa có xét nghiệm nào cho bước này.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                justifyContent: "center",
              }}
            >
              {labTests.map((test, index) => (
                <Card
                  key={test.id}
                  size="small"
                  style={{
                    width: 280,
                    border: `2px solid ${
                      test.result === "SUCCESS"
                        ? "#52c41a"
                        : test.result === "FAILURE"
                        ? "#ff4d4f"
                        : test.result === "UNDETERMINED"
                        ? "#faad14"
                        : "#d9d9d9"
                    }`,
                    borderRadius: 14,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                    marginBottom: 8,
                    background: "#fff",
                  }}
                  bodyStyle={{ padding: 20 }}
                >
                  {/* Icon kết quả */}
                  <div style={{ textAlign: "right", marginBottom: 12 }}>
                    {test.result === "SUCCESS" && (
                      <CheckCircleOutlined 
                        style={{ color: "#52c41a", fontSize: 20 }} 
                      />
                    )}
                    {test.result === "FAILURE" && (
                      <CloseOutlined 
                        style={{ color: "#ff4d4f", fontSize: 20 }} 
                      />
                    )}
                    {test.result === "UNDETERMINED" && (
                      <ExclamationCircleOutlined 
                        style={{ color: "#faad14", fontSize: 20 }} 
                      />
                    )}
                    {!test.result && (
                      <ClockCircleOutlined 
                        style={{ color: "#d9d9d9", fontSize: 20 }} 
                      />
                    )}
                  </div>

                  {/* Tên xét nghiệm */}
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 16 }}>
                      {test.testName}
                    </Text>
                  </div>

                  {/* Kết quả */}
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Kết quả: </Text>
                    <Tag
                      color={
                        test.result === "SUCCESS"
                          ? "green"
                          : test.result === "FAILURE"
                          ? "red"
                          : test.result === "UNDETERMINED"
                          ? "orange"
                          : "default"
                      }
                      style={{ fontSize: 13 }}
                    >
                      {test.result === "SUCCESS"
                        ? "Thành công"
                        : test.result === "FAILURE"
                        ? "Thất bại"
                        : test.result === "UNDETERMINED"
                        ? "Chưa xác định"
                        : "Chưa có"}
                    </Tag>
                  </div>

                  {/* Ghi chú */}
                  <div>
                    <Text strong>Ghi chú: </Text>
                    <Text
                      style={{
                        display: "block",
                        marginTop: 4,
                        wordWrap: "break-word",
                      }}
                    >
                      {test.notes || "Không có ghi chú"}
                    </Text>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TreatmentStagesView;
