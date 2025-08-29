import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Tag,
  Space,
  Divider,
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
  Timeline,
} from "antd";
import {
  MedicineBoxOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExperimentOutlined as TestTubeIcon,
  ArrowLeftOutlined,
  EditOutlined,
  RightOutlined,
  FileTextOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { treatmentService } from "../../service/treatment.service";
import { authService } from "../../service/auth.service";
import { useNavigate, useLocation } from "react-router-dom";
import { NotificationContext } from "../../App";

const { Title, Text } = Typography;
const {} = Collapse;
const { Option } = Select;

const TreatmentProgress = () => {
  // ===== KHAI BÁO CÁC STATE CHÍNH =====
  
  // State quản lý loading và dữ liệu chính
  const [loading, setLoading] = useState(true);                    // Trạng thái loading tổng thể
  const [treatmentData, setTreatmentData] = useState(null);        // Dữ liệu điều trị chi tiết hiện tại
  const [error, setError] = useState(null);                        // Thông báo lỗi nếu có
  const [treatments, setTreatments] = useState([]);                // Danh sách tất cả treatments của khách hàng
  
  // State quản lý view mode và navigation
  const [viewMode, setViewMode] = useState("list");               // Chế độ hiển thị: "list" hoặc "detail"
  const [currentPage, setCurrentPage] = useState(0);              // Trang hiện tại (0-based) cho pagination
  const [totalPages, setTotalPages] = useState(1);                // Tổng số trang

  // State quản lý modal chi tiết phase
  const [selectedPhase, setSelectedPhase] = useState(null);       // Phase được chọn để xem chi tiết
  const [modalOpen, setModalOpen] = useState(false);              // Hiển thị modal chi tiết phase

  // State quản lý modal yêu cầu đổi lịch
  const [changeModalVisible, setChangeModalVisible] = useState(false);   // Hiển thị modal đổi lịch
  const [changeStep, setChangeStep] = useState(null);                    // Step được chọn để đổi lịch
  const [changeAppointment, setChangeAppointment] = useState(null);      // Danh sách appointments của step
  const [changeForm] = Form.useForm();                                   // Form instance cho đổi lịch
  const [changeLoading, setChangeLoading] = useState(false);             // Loading khi xử lý đổi lịch
  const [selectedAppointment, setSelectedAppointment] = useState(null);  // Appointment được chọn để đổi

  // State quản lý modal xem lịch hẹn
  const [showScheduleModal, setShowScheduleModal] = useState(false);     // Hiển thị modal xem lịch hẹn
  const [scheduleStep, setScheduleStep] = useState(null);                // Step được chọn để xem lịch
  const [stepAppointments, setStepAppointments] = useState({});          // Object chứa appointments theo stepId
  const [showAllAppointments, setShowAllAppointments] = useState(false); // Hiển thị tất cả appointments hay chỉ 3 cái đầu

  // State quản lý Lab Tests (read-only for customer)
  const [showLabTestModal, setShowLabTestModal] = useState(false);       // Modal xem lab tests
  const [labTestStep, setLabTestStep] = useState(null);                  // Step được chọn để xem lab tests
  const [labTests, setLabTests] = useState([]);                          // Danh sách lab tests
  const [loadingLabTests, setLoadingLabTests] = useState(false);         // Loading lab tests

  // ===== HOOKS VÀ CONTEXT =====
  const location = useLocation();                                         // Hook lấy thông tin route và state
  const { showNotification } = useContext(NotificationContext);           // Context hiển thị thông báo
  
  // ===== LAB TEST HANDLERS (READ-ONLY FOR CUSTOMER) =====
  // Hàm xem lab tests của step (chỉ đọc, UI thân thiện cho customer)
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

  // ===== USEEFFECT: KHỞI TẠO VÀ TẢI DỮ LIỆU =====
  // useEffect này chạy khi component mount để kiểm tra có dữ liệu từ navigation không
  useEffect(() => {
    // Kiểm tra xem có được navigate từ trang khác với dữ liệu treatment không
    if (location.state?.treatmentRecord && location.state?.treatmentId) {
      setViewMode("detail");  // Chuyển sang chế độ detail nếu có dữ liệu
    }

    fetchData();  // Tải dữ liệu ban đầu
  }, []);

  // ===== HÀM TẢI DỮ LIỆU CHÍNH =====
  // Hàm này xử lý cả việc tải danh sách treatments và chi tiết treatment cụ thể
  const fetchData = async (page = 0) => {
    try {
      setLoading(true);

      // Lấy dữ liệu từ location.state (nếu được navigate từ trang khác)
      const treatmentRecord = location.state?.treatmentRecord;
      const treatmentId = location.state?.treatmentId;

      // ===== XỬ LÝ CHẾ ĐỘ DETAIL - Khi có treatmentId cụ thể =====
      if (treatmentRecord && treatmentId) {
        // Gọi API lấy chi tiết treatment record với đầy đủ steps
        const detailResponse = await treatmentService.getTreatmentRecordById(
          treatmentId
        );
        const detailData = detailResponse?.data?.result;

        if (detailData) {
          // Tính toán progress dựa trên số steps hoàn thành
          const totalSteps = detailData.treatmentSteps?.length || 0;
          const completedSteps =
            detailData.treatmentSteps?.filter(
              (step) => step.status === "COMPLETED"
            ).length || 0;
          const overallProgress =
            totalSteps > 0
              ? Math.round((completedSteps / totalSteps) * 100)
              : 0;

          // Format dữ liệu để hiển thị trong UI
          setTreatmentData({
            id: detailData.id,
            type: detailData.treatmentServiceName,             // Tên dịch vụ điều trị
            startDate: detailData.startDate,                   // Ngày bắt đầu
            currentPhase:                                      // Phase hiện tại (tính từ số steps hoàn thành)
              detailData.treatmentSteps?.findIndex(
                (step) => step.status === "COMPLETED"
              ) + 1 || 1,
            doctor: detailData.doctorName,                     // Tên bác sĩ
            status: detailData.status.toLowerCase(),           // Trạng thái (lowercase)
            estimatedCompletion:                               // Ngày dự kiến hoàn thành
              detailData.endDate ||
              dayjs(detailData.startDate).add(45, "days").format("YYYY-MM-DD"),
            nextAppointment: null,                             // Lịch hẹn tiếp theo (để null)
            overallProgress: overallProgress,                  // Phần trăm hoàn thành tổng thể
            customerId: detailData.customerId,                 // ID khách hàng
            result: detailData.result,                         // Kết quả điều trị
            notes: detailData.notes || "",                     // Ghi chú
            // Chuyển đổi treatmentSteps thành phases để hiển thị
            phases:
              detailData.treatmentSteps?.map((step, index) => ({
                id: step.id,
                name: step.name,                               // Tên bước điều trị
                statusRaw: step.status,                        // Trạng thái gốc
                status: step.status,                           // Trạng thái hiển thị
                displayDate: step.scheduledDate || null,       // Ngày hiển thị
                hasDate: !!step.scheduledDate,                 // Có ngày không
                startDate: step.scheduledDate,                 // Ngày bắt đầu
                endDate: step.actualDate,                      // Ngày kết thúc thực tế
                notes: step.notes || "",                       // Ghi chú
                appointment: null,                             // Appointment (để null, sẽ load riêng)
                // Activities cho từng bước
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
        // ===== XỬ LÝ CHẾ ĐỘ LIST - Tải danh sách tất cả treatments =====
        
        // Lấy thông tin user hiện tại
        const userResponse = await authService.getMyInfo();

        if (!userResponse?.data?.result?.id) {
          message.error(
            "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
          );
          return;
        }

        const customerId = userResponse.data.result.id;

        // Validation customerId
        if (!customerId) {
          message.error("ID người dùng không hợp lệ. Vui lòng đăng nhập lại.");
          return;
        }

        // Gọi API lấy danh sách treatment records với pagination
        const response = await treatmentService.getTreatmentRecords({
          customerId: customerId,
          page,                     // Trang hiện tại
          size: 10,                // Số items per page
        });
        
        // Cập nhật pagination info
        setCurrentPage(page);
        setTotalPages(response.data.result.totalPages);
        
        // Xử lý và format dữ liệu treatments
        if (response?.data?.code === 1000 && response.data.result?.content) {
          const treatmentRecords = response.data.result.content
            .filter((treatment) => treatment.status !== "CANCELLED")  // Loại bỏ treatments đã hủy
            .sort(
              // Sắp xếp theo ngày tạo mới nhất
              (a, b) =>
                new Date(b.createdDate || b.startDate) -
                new Date(a.createdDate || a.startDate)
            );

          // Map dữ liệu để hiển thị trong table
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
                serviceName: treatment.serviceName,             // Tên dịch vụ
                doctorName: treatment.doctorName,               // Tên bác sĩ
                startDate: treatment.startDate,                 // Ngày bắt đầu
                status: treatment.status,                       // Trạng thái
                progress: progress,                             // Phần trăm tiến độ
                totalSteps: treatment.totalSteps,               // Tổng số bước
                completedSteps: treatment.completedSteps,       // Số bước đã hoàn thành
                customerId: customerId,                         // ID khách hàng
                result: treatment.result,                       // Kết quả điều trị
                notes: treatment.notes,                         // Ghi chú
              };
            })
          );
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Có lỗi xảy ra khi tải dữ liệu");
      
      // Xử lý các loại lỗi cụ thể
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== HÀM XỬ LÝ YÊU CẦU ĐỔI LỊCH HẸN =====
  // Hàm mở modal đổi lịch hẹn và tải danh sách appointments của step
  const handleOpenChangeModal = async (step) => {
    setChangeStep(step);                // Set step cần đổi lịch
    setChangeAppointment(null);         // Reset danh sách appointments
    setChangeModalVisible(true);        // Hiển thị modal
    setChangeLoading(true);             // Bắt đầu loading

    try {
      // Gọi API lấy appointments thật cho step này
      const appointmentsResponse =
        await treatmentService.getAppointmentsByStepId(step.id);
      const appointments = appointmentsResponse?.data?.result || [];
      setChangeAppointment(appointments);
    } catch (error) {
      console.error("Lỗi khi mở modal đổi lịch:", error);
      message.error("Không thể mở form đổi lịch hẹn");
      setChangeAppointment([]);
    } finally {
      setChangeLoading(false);
    }
  };

  // Hàm submit yêu cầu thay đổi lịch hẹn
  const handleSubmitChange = async () => {
    if (!selectedAppointment) {
      showNotification("Vui lòng chọn lịch hẹn để thay đổi", "error");
      return;
    }

    try {
      setChangeLoading(true);
      
      // Validate form trước khi submit
      const values = await changeForm.validateFields();

      // Debug logging
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

      // Gọi API gửi yêu cầu thay đổi lịch hẹn
      const response = await treatmentService.requestChangeAppointment(
        selectedAppointment.id,
        {
          requestedDate: values.requestedDate.format("YYYY-MM-DD"),  // Ngày mới
          requestedShift: values.requestedShift,                     // Ca mới
          notes: values.notes || "",                                 // Lý do đổi lịch
        }
      );

      console.log("Change request response:", response);

      // Kiểm tra response thành công
      if (response?.data?.code === 1000 || response?.status === 200) {
        showNotification("Đã gửi yêu cầu thay đổi lịch hẹn!", "success");
        
        // Cleanup modal
        setChangeModalVisible(false);
        setSelectedAppointment(null);
        changeForm.resetFields();
        
        // Reload lại lịch hẹn cho step vừa đổi
        try {
          const res = await treatmentService.getAppointmentsByStepId(
            changeStep.id
          );
          setStepAppointments((prev) => ({
            ...prev,
            [changeStep.id]: res?.data?.result || [],
          }));
        } catch (error) {
          setStepAppointments((prev) => ({ ...prev, [changeStep.id]: [] }));
        }
        
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
                  status: "PENDING_CHANGE",                      // Trạng thái chờ duyệt
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

      // Xử lý các mã lỗi cụ thể
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

  // ===== HÀM XỬ LÝ EXPAND PHASE =====
  // Hàm tải appointments khi expand một phase (nếu chưa có)
  const handleExpandPhase = async (phase) => {
    if (!stepAppointments[phase.id]) {
      try {
        // Gọi API lấy appointments cho phase này
        const res = await treatmentService.getAppointmentsByStepId(phase.id);
        setStepAppointments((prev) => ({
          ...prev,
          [phase.id]: res?.data?.result || [],
        }));
      } catch (error) {
        setStepAppointments((prev) => ({ ...prev, [phase.id]: [] }));
      }
    }
  };

  // ===== UTILITY FUNCTIONS - HÀM TIỆN ÍCH =====
  
  // Hàm lấy Tag component với màu sắc cho trạng thái
  const getStatusTag = (status) => {
    switch ((status || "").toUpperCase()) {
      case "COMPLETED":
        return <Tag color="success">Hoàn thành</Tag>;
      case "INPROGRESS":
        return <Tag color="processing">Đang điều trị</Tag>;
      case "CONFIRMED":
        return <Tag color="processing">Đã xác nhận</Tag>;
      case "PENDING":
      case "PLANED":
        return <Tag color="warning">Đã đặt lịch</Tag>;
      case "CANCELLED":
        return <Tag color="error">Đã hủy</Tag>;
      case "PENDING_CHANGE":
        return <Tag color="purple">Chờ duyệt đổi lịch</Tag>;
      case "REJECTED":
        return <Tag color="volcano">Từ chối yêu cầu đổi lịch</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // Hàm lấy Tag component cho trạng thái step
  const getStepStatusTag = (status) => {
    switch (status) {
      case "COMPLETED":
        return <Tag color="success">Hoàn thành</Tag>;
      case "INPROGRESS":
        return <Tag color="orange">Đang điều trị</Tag>;
      case "CONFIRMED":
        return <Tag color="processing">Đã xác nhận</Tag>;
      case "CANCELLED":
        return <Tag color="error">Đã hủy</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // Hàm lấy màu sắc cho trạng thái treatment step
  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "processing";
      case "PLANED":
        return "warning";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "error";
      case "INPROGRESS":
        return "orange";
      default:
        return "processing";
    }
  };

  // Hàm lấy text hiển thị cho trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "PLANED":
        return "Chờ xếp lịch";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "INPROGRESS":
        return "Đang điều trị";
      case "PENDING_CHANGE":
        return "Chờ duyệt đổi lịch";
      default:
        return status;
    }
  };

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
      case "PENDING_CHANGE":
        return "gold";
      default:
        return "default";
    }
  };

  // Hàm lấy text hiển thị cho trạng thái appointment
  const getAppointmentStatusText = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "COMPLETED":
        return "Hoàn thành";
      case "INPROGRESS":
        return "Đang điều trị";
      case "PLANED":
        return "Đã lên lịch";
      case "CANCELLED":
        return "Đã hủy";
      case "PENDING_CHANGE":
        return "Chờ duyệt đổi lịch";
      case "REJECTED":
        return "Từ chối yêu cầu đổi lịch";
      default:
        return status;
    }
  };

  // Hàm lấy thông tin phase hiện tại
  const getCurrentPhase = () => {
    if (!treatmentData?.phases) return null;

    // Tìm phase đầu tiên chưa hoàn thành
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

    // Nếu tất cả đã hoàn thành, lấy phase cuối cùng
    const lastPhase = treatmentData.phases[treatmentData.phases.length - 1];
    return {
      name: lastPhase.name,
      status: lastPhase.statusRaw,
      notes: "Đã hoàn thành",
    };
  };

  // ===== HÀM RENDER CÁC PHASES =====
  // Hàm tạo cấu trúc dữ liệu cho Collapse component hiển thị các phases
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
            {/* Bảng thông tin chi tiết của phase */}
            <Descriptions size="small" column={3} bordered>
              <Descriptions.Item label="Ngày bắt đầu">
                {phase.startDate
                  ? dayjs(phase.startDate).format("DD/MM/YYYY")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày hoàn thành">
                {phase.endDate
                  ? dayjs(phase.endDate).format("DD/MM/YYYY")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {phase.notes || "-"}
              </Descriptions.Item>
            </Descriptions>

            {/* Nút gửi yêu cầu đổi lịch hẹn: chỉ hiển thị cho phases chưa hoàn thành */}
            {phase.statusRaw !== "COMPLETED" && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                style={{
                  marginBottom: 12,
                  backgroundColor: "#1890ff",
                  borderColor: "#1890ff",
                }}
                onClick={() => handleOpenChangeModal(phase)}
              >
                Gửi yêu cầu thay đổi lịch hẹn
              </Button>
            )}
            
            {/* Danh sách lịch hẹn của phase này */}
            {Array.isArray(stepAppointments[phase.id]) &&
              stepAppointments[phase.id].length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <Text strong>Lịch hẹn:</Text>
                  {stepAppointments[phase.id].map((appointment, idx) => (
                    <div
                      key={appointment.id || idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      {/* Dot indicator theo màu trạng thái */}
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background:
                            appointment.status === "CONFIRMED"
                              ? "#1890ff"
                              : appointment.status === "PENDING"
                              ? "#faad14"
                              : appointment.status === "COMPLETED"
                              ? "#52c41a"
                              : appointment.status === "CANCELLED"
                              ? "#ff4d4f"
                              : "#d9d9d9",
                          marginRight: 4,
                        }}
                      />
                      <span style={{ fontWeight: 500 }}>
                        {appointment.purpose || phase.name}
                      </span>
                      {getStatusTag(appointment.status)}
                      <CalendarOutlined
                        style={{ marginLeft: 8, marginRight: 4 }}
                      />
                      <span>
                        {dayjs(appointment.appointmentDate).format(
                          "DD/MM/YYYY"
                        )}
                      </span>
                      <span style={{ marginLeft: 8 }}>
                        - Ca:{" "}
                        {appointment.shift === "MORNING" ? "Sáng" : "Chiều"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            {/* Message khi phase không có activities */}
            {phase.activities.length === 0 && (
              <div style={{ marginTop: 16, color: "#666" }}>
                Chưa có hoạt động được lên lịch
              </div>
            )}
          </div>
        ),
        onClick: () => handleExpandPhase(phase),  // Load appointments khi expand
      }))
    );
  };

  // ===== TÍNH TOÁN STATISTICS =====
  // Các hàm tính toán thống kê về treatment progress
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

  // ===== HANDLER CHO CLICK STEP =====
  const handleStepClick = (phase) => {
    setSelectedPhase(phase);
    setModalOpen(true);
  };

  // ===== HÀM MỞ MODAL XEM LỊCH HẸN =====
  // Hàm mở modal xem lịch hẹn của bước điều trị
  const handleShowScheduleModal = async (step) => {
    setScheduleStep(step);                  // Set step để xem lịch
    setShowScheduleModal(true);             // Hiển thị modal
    setShowAllAppointments(false);          // Reset về hiển thị 3 lịch hẹn đầu
    
    try {
      // Gọi API lấy lịch hẹn của step
      const response = await treatmentService.getAppointmentsByStepId(step.id);
      
      // Xử lý response có thể có nhiều format khác nhau
      let appointments = [];
      if (response?.data?.result?.content) {
        appointments = response.data.result.content;  // Paginated response
      } else if (Array.isArray(response?.data?.result)) {
        appointments = response.data.result;          // Array response
      } else if (Array.isArray(response)) {
        appointments = response;                      // Direct array
      }
      
      // Reset showAll state cho tất cả appointments
      const appointmentsWithState = appointments.map((app) => ({
        ...app,
        showAll: false,
      }));
      
      setStepAppointments((prev) => ({
        ...prev,
        [step.id]: appointmentsWithState,
      }));
    } catch (error) {
      setStepAppointments((prev) => ({ ...prev, [step.id]: [] }));
    }
  };

  // ===== HÀM XÁC ĐỊNH TRẠNG THÁI TỔNG THỂ =====
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

  // Hàm lấy màu progress bar theo phần trăm
  const getProgressColor = (progress) => {
    if (progress === 0) return "#faad14";     // Vàng cho 0%
    if (progress === 100) return "#52c41a";   // Xanh cho 100%
    return "#1890ff";                         // Xanh dương cho progress khác
  };

  // ===== HÀM CHUYỂN ĐỔI KẾT QUẢ ĐIỀU TRỊ =====
  // Hàm chuyển đổi result code thành text tiếng Việt
  const getResultText = (result) => {
    switch ((result || "").toUpperCase()) {
      case "SUCCESS":
        return "Thành công";
      case "FAILURE":
        return "Thất bại";
      case "UNDETERMINED":
        return "Chưa xác định";
      default:
        return "Chưa có";
    }
  };

  // ===== COMPONENT RENDER TREATMENT OVERVIEW =====
  // Component hiển thị thông tin tổng quan về treatment
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
      <Row gutter={[24, 16]}>
        <Col xs={24} md={24}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Space>
                <Text strong style={{ fontSize: 16 }}>
                  Gói điều trị:
                </Text>
                <Text style={{ fontSize: 16 }}>{treatmentData.type}</Text>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Space>
                <Text strong>Bác sĩ:</Text>
                <Text>{treatmentData.doctor}</Text>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Space>
                <Text strong>Ngày bắt đầu:</Text>
                <Text>
                  {dayjs(treatmentData.startDate).format("DD/MM/YYYY")}
                </Text>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Space>
                <Text strong>Ngày đầu chu kì:</Text>
                <Text>{dayjs(treatmentData.cd1Date).format("DD/MM/YYYY")}</Text>
              </Space>
            </Col>
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
  );

  // ===== COMPONENT RENDER TREATMENT PROGRESS =====
  // Component hiển thị timeline tiến độ điều trị
  const renderTreatmentProgress = () => (
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
      styles={{ body: { padding: 32 } }}
    >
      <Timeline style={{ marginLeft: 16 }}>
        {treatmentData.phases.map((step, index) => (
          <Timeline.Item
            key={step.id}
            color={getStatusColor(step.statusRaw)}
            dot={
              // Custom dot với số thứ tự và màu sắc theo trạng thái
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background:
                    getStatusColor(step.statusRaw) === "success"
                      ? "#e6fffb"
                      : getStatusColor(step.statusRaw) === "error"
                      ? "#fff1f0"
                      : getStatusColor(step.statusRaw) === "processing"
                      ? "#e6f7ff"
                      : getStatusColor(step.statusRaw) === "orange"
                      ? "#fff7e6"
                      : "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `3px solid ${
                    getStatusColor(step.statusRaw) === "success"
                      ? "#52c41a"
                      : getStatusColor(step.statusRaw) === "error"
                      ? "#ff4d4f"
                      : getStatusColor(step.statusRaw) === "processing"
                      ? "#1890ff"
                      : getStatusColor(step.statusRaw) === "orange"
                      ? "#fa8c16"
                      : "#d9d9d9"
                  }`,
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    color:
                      getStatusColor(step.statusRaw) === "success"
                        ? "#52c41a"
                        : getStatusColor(step.statusRaw) === "error"
                        ? "#ff4d4f"
                        : getStatusColor(step.statusRaw) === "processing"
                        ? "#1890ff"
                        : getStatusColor(step.statusRaw) === "orange"
                        ? "#fa8c16"
                        : "#bfbfbf",
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </span>
              </div>
            }
          >
            {/* Card chi tiết cho từng step */}
            <Card
              size="small"
              style={{
                marginBottom: 24,
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(24,144,255,0.08)",
                background: index === 0 ? "#fafdff" : "#fff",  // Step đầu tiên có màu khác
                transition: "box-shadow 0.2s",
                border: `1.5px solid ${
                  getStatusColor(step.statusRaw) === "success"
                    ? "#52c41a"
                    : getStatusColor(step.statusRaw) === "error"
                    ? "#ff4d4f"
                    : getStatusColor(step.statusRaw) === "processing"
                    ? "#1890ff"
                    : getStatusColor(step.statusRaw) === "orange"
                    ? "#fa8c16"
                    : "#d9d9d9"
                }`,
              }}
              styles={{ body: { padding: 24 } }}
              hoverable
            >
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={16}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
                      Bước {index + 1}: {step.name}
                    </Text>
                    <Tag
                      color={getStatusColor(step.statusRaw)}
                      style={{ fontSize: 15, padding: "4px 16px" }}
                    >
                      {getStatusText(step.statusRaw)}
                    </Tag>
                  </div>
                  
                  {/* Bảng thông tin chi tiết */}
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
                
                {/* Cột action buttons */}
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
                      }}
                      onClick={() => handleShowScheduleModal(step)}
                    >
                      Xem lịch hẹn
                    </Button>
                    <Button
                      type="default"
                      icon={<TestTubeIcon />}
                      style={{
                        borderRadius: 8,
                        fontWeight: 600,
                        minWidth: 140,
                        background: "#f6ffed",
                        borderColor: "#52c41a",
                        color: "#52c41a",
                      }}
                      onClick={() => handleShowLabTestModal(step)}
                    >
                      Kết quả xét nghiệm
                    </Button>
                    {/* Nút gửi yêu cầu đổi lịch: chỉ hiển thị cho steps chưa hoàn thành */}
                    {(step.statusRaw !== "COMPLETED" ||
                      step.statusRaw !== "PENDING_CHANGE") && (
                      <Button
                        type="default"
                        icon={<EditOutlined />}
                        style={{
                          borderRadius: 8,
                          fontWeight: 600,
                          minWidth: 140,
                        }}
                        onClick={() => handleOpenChangeModal(step)}
                      >
                        Gửi yêu cầu đổi hẹn
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );

  // ===== CẤU HÌNH COLUMNS CHO TABLE =====
  // Cấu hình các cột cho bảng danh sách treatments
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
      title: "Kết quả",
      dataIndex: "result",
      key: "result",
      render: (result) => (
        <Tag
          color={
            result === "SUCCESS"
              ? "green"
              : result === "FAILURE"
              ? "red"
              : result === "UNDETERMINED"
              ? "orange"
              : "default"
          }
        >
          {getResultText(result)}
        </Tag>
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

  // ===== HÀM XEM CHI TIẾT TREATMENT =====
  // Hàm xử lý khi click vào nút "Chi tiết" trong table
  const handleViewDetail = async (record) => {
    try {
      setLoading(true);

      // Lấy chi tiết treatment record bằng API
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

      // Lấy appointments cho từng step song song
      const stepsWithAppointments = await Promise.all(
        treatmentSteps.map(async (step) => {
          try {
            const appointmentsResponse =
              await treatmentService.getAppointmentsByStepId(step.id);
            const appointments = appointmentsResponse?.data?.result || [];
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

      // Set dữ liệu đã format cho detail view
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
        result: detailData.result,
        notes: detailData.notes || "",
        phases: stepsWithAppointments.map((step, index) => ({
          id: step.id,
          name: step.name,
          statusRaw: step.status,
          status: step.status,
          startDate: step.startDate,
          endDate: step.endDate,
          notes: step.notes || "",
          appointment: step.appointments[0] || null,  // Lấy appointment đầu tiên
          activities: [
            {
              name: step.name,
              date: step.startDate,
              status: step.status,
              notes: step.notes || "",
            },
          ],
        })),
      });

      setViewMode("detail");       // Chuyển sang chế độ detail
      setSelectedPhase(null);      // Reset selected phase
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết điều trị:", error);
      message.error("Không thể lấy thông tin chi tiết điều trị");
    } finally {
      setLoading(false);
    }
  };

  // ===== COMPONENT RENDER LIST VIEW =====
  // Component hiển thị danh sách treatments trong table
  const renderListView = () => (
    <div style={{ padding: "24px" }}>
      <Card>
        <Table
          columns={columns}
          dataSource={treatments}
          loading={loading}
          pagination={false}  // Disable built-in pagination
        />
        
        {/* Custom pagination controls */}
        <div className="flex justify-end mt-4">
          <Button
            disabled={currentPage === 0}
            onClick={() => fetchData(currentPage - 1)}
            className="mr-2"
          >
            Trang trước
          </Button>
          <span className="px-4 py-1 bg-gray-100 rounded text-sm">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <Button
            disabled={currentPage + 1 >= totalPages}
            onClick={() => fetchData(currentPage + 1)}
            className="ml-2"
          >
            Trang tiếp
          </Button>
        </div>
      </Card>
    </div>
  );

  // ===== RENDER LOADING STATE =====
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  // ===== RENDER ERROR STATE =====
  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  // ===== RENDER LIST VIEW =====
  // Nếu đang ở chế độ list, hiển thị bảng danh sách
  if (viewMode === "list") {
    return renderListView();
  }

  // ===== RENDER EMPTY STATE =====
  // Nếu không có dữ liệu treatment trong detail view
  if (!treatmentData || !treatmentData.phases) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Text type="secondary">Không có thông tin điều trị</Text>
      </div>
    );
  }

  // ===== RENDER MAIN DETAIL VIEW =====
  return (
    <div>
      {/* ===== HEADER SECTION ===== */}
      {/* Header với nút quay lại và title */}
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
              setViewMode("list");         // Chuyển về list view
              setTreatmentData(null);      // Clear data chi tiết
            }}
            style={{ border: "none", boxShadow: "none" }}
          />
          <Title level={4} style={{ margin: 0 }}>
            Tiến độ điều trị
          </Title>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      {renderTreatmentOverview()}     {/* Thông tin tổng quan */}
      {renderTreatmentProgress()}     {/* Timeline tiến độ */}

      {/* ===== MODAL CHI TIẾT PHASE ===== */}
      {/* Modal hiển thị thông tin chi tiết của một phase */}
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

      {/* ===== MODAL ĐỔI LỊCH HẸN ===== */}
      {/* Modal để customer gửi yêu cầu thay đổi lịch hẹn */}
      <Modal
        title={`Gửi yêu cầu thay đổi lịch hẹn: ${changeStep?.name || ""}`}
        open={changeModalVisible}
        onCancel={() => setChangeModalVisible(false)}
        onOk={handleSubmitChange}
        okText="Gửi yêu cầu"
        confirmLoading={changeLoading}
        destroyOnHidden
        width={800}
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={changeLoading}
            onClick={handleSubmitChange}
          >
            Gửi yêu cầu
          </Button>,
        ]}
      >
        {changeLoading ? (
          <Spin />
        ) : changeAppointment && Array.isArray(changeAppointment) ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Chọn lịch hẹn muốn thay đổi:</Text>
            </div>
            
            {/* Table hiển thị danh sách appointments để chọn */}
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
                      case "PLANED":
                        return <Tag color="orange">Đã đặt lịch</Tag>;
                      case "PENDING_CHANGE":
                        return <Tag color="purple">Chờ duyệt đổi lịch</Tag>;
                      case "REJECTED":
                        return (
                          <Tag color="volcano">Từ chối yêu cầu đổi lịch</Tag>
                        );
                      case "COMPLETED":
                        return <Tag color="green">Đã hoàn thành</Tag>;
                      case "CANCELLED":
                        return <Tag color="error">Đã hủy</Tag>;
                      case "INPROGRESS":
                        return <Tag color="#1890ff">Đang điều trị</Tag>;
                      default:
                        return <Tag color="default">{status}</Tag>;
                    }
                  },
                },
                {
                  title: "Lí do",
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
                        // Pre-fill form với dữ liệu appointment hiện tại
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

            {/* Form nhập thông tin lịch hẹn mới */}
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
                  <Form.Item label="Lí do" name="notes">
                    <Input.TextArea
                      rows={2}
                      placeholder="Nhập lí do (nếu có)"
                    />
                  </Form.Item>
                </Form>
              </div>
            )}
          </div>
        ) : (
          // Alert hiển thị khi không có appointments
          <Alert
            type="warning"
            message="Không tìm thấy lịch hẹn tương ứng cho bước này!"
          />
        )}
      </Modal>

      {/* ===== MODAL XEM LỊCH HẸN CỦA BƯỚC ĐIỀU TRỊ ===== */}
      {/* Modal hiển thị danh sách appointments của một treatment step */}
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
          
          {!stepAppointments[scheduleStep?.id] ||
          stepAppointments[scheduleStep?.id].length === 0 ? (
            // Empty state khi không có appointments
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
              {/* Hiển thị 3 appointments đầu tiên */}
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
                    
                    // Icon theo trạng thái
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
                        styles={{ body: { padding: 16 } }}
                      >
                        {/* Icon trạng thái */}
                        <div
                          style={{ position: "absolute", top: 10, right: 10 }}
                        >
                          {statusIcon}
                        </div>
                        
                        {/* Thông tin appointment */}
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

              {/* Hiển thị các appointments còn lại khi click "Xem thêm" */}
              {stepAppointments[scheduleStep?.id]?.some(
                (app) => app.showAll
              ) && (
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
                          styles={{ body: { padding: 16 } }}
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
              )}

              {/* Nút "Xem thêm" / "Ẩn bớt" */}
              {stepAppointments[scheduleStep?.id]?.length > 3 && (
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  {stepAppointments[scheduleStep?.id]?.some(
                    (app) => app.showAll
                  ) ? (
                    <Button
                      type="default"
                      icon={<FileTextOutlined />}
                      onClick={() => {
                        setStepAppointments((prev) => {
                          if (prev[scheduleStep?.id]) {
                            return {
                              ...prev,
                              [scheduleStep?.id]: prev[scheduleStep?.id].map(
                                (app) => ({ ...app, showAll: false })
                              ),
                            };
                          }
                          return prev;
                        });
                      }}
                      style={{ borderRadius: 8, minWidth: 140 }}
                    >
                      Ẩn bớt
                    </Button>
                  ) : (
                    <Button
                      type="default"
                      icon={<FileTextOutlined />}
                      onClick={() => {
                        setStepAppointments((prev) => {
                          if (prev[scheduleStep?.id]) {
                            return {
                              ...prev,
                              [scheduleStep?.id]: prev[scheduleStep?.id].map(
                                (app) => ({ ...app, showAll: true })
                              ),
                            };
                          }
                          return prev;
                        });
                      }}
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

      {/* ===== LAB TESTS MODAL (READ-ONLY FOR CUSTOMER) ===== */}
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            <TestTubeIcon
              style={{ fontSize: 24, color: "#52c41a", marginRight: 8 }}
            />
            Kết quả xét nghiệm của bạn
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
          <div style={{ 
            fontWeight: 600, 
            marginBottom: 16, 
            fontSize: 16,
            color: "#1890ff",
            textAlign: "center"
          }}>
            Xét nghiệm cho giai đoạn: {labTestStep?.name}
          </div>
          
          {loadingLabTests ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <Spin size="large" />
              <div style={{ marginTop: 12, color: "#666" }}>
                Đang tải kết quả xét nghiệm...
              </div>
            </div>
          ) : labTests.length === 0 ? (
            <div
              style={{
                color: "#888",
                textAlign: "center",
                padding: 30,
                background: "#f9f9f9",
                borderRadius: 12,
                border: "2px dashed #d9d9d9",
              }}
            >
              <TestTubeIcon style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 12 }} />
              <div style={{ fontSize: 16, marginBottom: 8 }}>
                Chưa có kết quả xét nghiệm
              </div>
              <div style={{ fontSize: 14, color: "#999" }}>
                Kết quả sẽ được cập nhật sau khi bác sĩ hoàn tất
              </div>
            </div>
          ) : (
            <>
              <div style={{ 
                background: "#e6f7ff", 
                padding: 12, 
                borderRadius: 8, 
                marginBottom: 16,
                textAlign: "center"
              }}>
                <Text style={{ color: "#1890ff" }}>
                  📋 Có {labTests.length} kết quả xét nghiệm
                </Text>
              </div>
              
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
                      width: 300,
                      border: `3px solid ${
                        test.result === "SUCCESS"
                          ? "#52c41a"
                          : test.result === "FAILURE"
                          ? "#ff4d4f"
                          : test.result === "UNDETERMINED"
                          ? "#faad14"
                          : "#e6f7ff"
                      }`,
                      borderRadius: 16,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      marginBottom: 8,
                      background: test.result === "SUCCESS" 
                        ? "#f6ffed" 
                        : test.result === "FAILURE" 
                        ? "#fff1f0"
                        : test.result === "UNDETERMINED"
                        ? "#fffbe6"
                        : "#f0f8ff",
                    }}
                    bodyStyle={{ padding: 24 }}
                  >
                    {/* Icon kết quả lớn hơn */}
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      {test.result === "SUCCESS" && (
                        <div>
                          <CheckCircleOutlined 
                            style={{ color: "#52c41a", fontSize: 32 }} 
                          />
                          <div style={{ color: "#52c41a", fontWeight: "bold", marginTop: 4 }}>
                            KẾT QUẢ TỐT
                          </div>
                        </div>
                      )}
                      {test.result === "FAILURE" && (
                        <div>
                          <CloseOutlined 
                            style={{ color: "#ff4d4f", fontSize: 32 }} 
                          />
                          <div style={{ color: "#ff4d4f", fontWeight: "bold", marginTop: 4 }}>
                            CẦN THEO DÕI
                          </div>
                        </div>
                      )}
                      {test.result === "UNDETERMINED" && (
                        <div>
                          <ExclamationCircleOutlined 
                            style={{ color: "#faad14", fontSize: 32 }} 
                          />
                          <div style={{ color: "#faad14", fontWeight: "bold", marginTop: 4 }}>
                            ĐANG ĐÁNH GIÁ
                          </div>
                        </div>
                      )}
                      {!test.result && (
                        <div>
                          <ClockCircleOutlined 
                            style={{ color: "#1890ff", fontSize: 32 }} 
                          />
                          <div style={{ color: "#1890ff", fontWeight: "bold", marginTop: 4 }}>
                            CHỜ KẾT QUẢ
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tên xét nghiệm */}
                    <div style={{ marginBottom: 16, textAlign: "center" }}>
                      <Text strong style={{ fontSize: 18, color: "#262626" }}>
                        {test.testName}
                      </Text>
                    </div>

                    {/* Ghi chú từ bác sĩ */}
                    {test.notes && (
                      <div style={{ 
                        background: "#fafafa", 
                        padding: 12, 
                        borderRadius: 8,
                        border: "1px solid #f0f0f0"
                      }}>
                        <Text strong style={{ color: "#1890ff" }}>
                          💬 Lời nhắn từ bác sĩ:
                        </Text>
                        <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>
                          {test.notes}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Lời khuyên chung */}
              <div style={{ 
                marginTop: 20, 
                padding: 16, 
                background: "#f6ffed", 
                borderRadius: 8,
                border: "1px solid #b7eb8f",
                textAlign: "center"
              }}>
                <Text style={{ color: "#52c41a", fontWeight: "500" }}>
                  💡 Hãy liên hệ với bác sĩ nếu bạn có thắc mắc về kết quả
                </Text>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default TreatmentProgress;
