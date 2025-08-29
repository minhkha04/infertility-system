import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Spin,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  DatePicker,
  Input,
  Select,
  Row,
  Col,
  Avatar,
  Tooltip,
  Badge,
  Switch,
  Radio,
  Dropdown,
  Timeline,
  Descriptions,
  Table,
  Popconfirm,
  AutoComplete,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  SwapOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { treatmentService } from "../../service/treatment.service";
import { authService } from "../../service/auth.service";
import dayjs from "dayjs";
import { NotificationContext } from "../../App";
import { createLabTestHandlers } from "../../service/labTestHandlers";

const { Title, Text } = Typography;
const { TextArea } = Input;

const TreatmentStageDetails = () => {
  console.log("🚀 TreatmentStageDetails component loaded");

  // ===== KHAI BÁO CÁC STATE CHÍNH =====
  
  // State quản lý loading và dữ liệu chính
  const [loading, setLoading] = useState(true);                    // Trạng thái loading tổng thể
  const [treatmentData, setTreatmentData] = useState(null);        // Dữ liệu điều trị chính (bao gồm steps)
  const [doctorId, setDoctorId] = useState(null);                  // ID của bác sĩ hiện tại
  
  // State quản lý modal và form chỉnh sửa step
  const [editingStep, setEditingStep] = useState(null);            // Step đang được chỉnh sửa
  const [form] = Form.useForm();                                   // Form instance cho chỉnh sửa step
  
  // State quản lý modal xem lịch hẹn
  const [showScheduleModal, setShowScheduleModal] = useState(false);   // Hiển thị modal xem lịch hẹn
  const [scheduleForm] = Form.useForm();                              // Form instance cho lịch hẹn
  const [scheduleStep, setScheduleStep] = useState(null);             // Step được chọn để xem lịch
  const [stepAppointments, setStepAppointments] = useState([]);       // Danh sách lịch hẹn của step
  const [loadingAppointments, setLoadingAppointments] = useState(false); // Loading khi tải lịch hẹn
  
  // State quản lý modal chi tiết step
  const [selectedStep, setSelectedStep] = useState(null);             // Step được chọn để xem chi tiết
  const [showStepDetailModal, setShowStepDetailModal] = useState(false); // Hiển thị modal chi tiết step
  
  // State quản lý modal tạo lịch hẹn mới
  const [showCreateAppointmentModal, setShowCreateAppointmentModal] = useState(false);
  
  // State quản lý modal thêm step mới
  const [showAddStepModal, setShowAddStepModal] = useState(false);     // Hiển thị modal thêm step
  const [addStepForm] = Form.useForm();                               // Form instance cho thêm step
  const [addStepAuto, setAddStepAuto] = useState(false);              // Tự động thêm step theo giai đoạn
  const [addStepLoading, setAddStepLoading] = useState(false);        // Loading khi thêm step
  const [stageOptions, setStageOptions] = useState([]);              // Danh sách giai đoạn có thể chọn
  const [editingStepStageId, setEditingStepStageId] = useState(null); // Stage ID của step đang edit
  const [allStagesUsed, setAllStagesUsed] = useState(false);          // Tất cả stages đã được sử dụng
  
  // State quản lý modal thay đổi dịch vụ
  const [showChangeServiceModal, setShowChangeServiceModal] = useState(false); // Hiển thị modal đổi dịch vụ
  const [serviceOptions, setServiceOptions] = useState([]);                   // Danh sách dịch vụ có thể chọn
  const [selectedServiceId, setSelectedServiceId] = useState(null);           // Dịch vụ được chọn
  
  // State quản lý modal chọn kết quả điều trị
  const [showResultModal, setShowResultModal] = useState(false);              // Hiển thị modal chọn kết quả
  const [pendingCompleteStatus, setPendingCompleteStatus] = useState(null);   // Trạng thái chờ hoàn thành
  const [selectedResult, setSelectedResult] = useState(null);                 // Kết quả điều trị được chọn
  
  // State quản lý modal hủy điều trị
  const [isModalVisible, setIsModalVisible] = useState(false);                // Hiển thị modal hủy điều trị
  const [cancelReason, setCancelReason] = useState("");                       // Lý do hủy điều trị
  const [selectedTreatment, setSelectedTreatment] = useState(null);           // Điều trị được chọn để hủy
  const [cancelLoading, setCancelLoading] = useState(false);                  // Loading khi hủy điều trị
  
  // State quản lý modal ghi chú
  const [showNoteModal, setShowNoteModal] = useState(false);                  // Hiển thị modal nhập ghi chú
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);       // Cập nhật trạng thái chờ xử lý { appointmentId, newStatus }
  const [note, setNote] = useState("");                                       // Ghi chú nhập từ modal
  
  // ===== STATE QUẢN LÝ LAB TESTS =====
  const [showLabTestModal, setShowLabTestModal] = useState(false);            // Hiển thị modal quản lý lab tests
  const [labTestStep, setLabTestStep] = useState(null);                       // Step được chọn để xem lab tests
  const [labTests, setLabTests] = useState([]);                               // Danh sách lab tests của step
  const [loadingLabTests, setLoadingLabTests] = useState(false);              // Loading khi tải lab tests
  const [showAddLabTestModal, setShowAddLabTestModal] = useState(false);      // Hiển thị modal thêm lab test
  const [editingLabTest, setEditingLabTest] = useState(null);                 // Lab test đang được chỉnh sửa
  const [labTestForm] = Form.useForm();                                       // Form instance cho lab test
  const [labTestTypes, setLabTestTypes] = useState([]);                       // Danh sách loại xét nghiệm có sẵn
  const [loadingLabTestTypes, setLoadingLabTestTypes] = useState(false);      // Loading khi tải loại xét nghiệm
  
  // ===== HOOKS VÀ CONTEXT =====
  const location = useLocation();                                             // Hook lấy thông tin route hiện tại
  const navigate = useNavigate();                                             // Hook điều hướng
  const { showNotification } = useContext(NotificationContext);               // Context hiển thị thông báo
  const dataLoadedRef = React.useRef(false);                                  // Ref để tránh load dữ liệu trùng lặp
  
  // ===== LAB TEST HANDLERS =====
  const labTestHandlers = createLabTestHandlers(
    setLabTestStep,
    setShowLabTestModal,
    setLoadingLabTests,
    setLabTests,
    showNotification,
    setEditingLabTest,
    setShowAddLabTestModal,
    labTestForm,
    setLabTestTypes,
    setLoadingLabTestTypes
  );
  
  const {
    handleShowLabTestModal,
    handleLabTestSubmit,
    handleDeleteLabTest,
    handleShowAddLabTestModal
  } = labTestHandlers;
  
  // ===== CÁC OPTION CHO SELECT =====
  const statusOptions = [
    { value: "PLANED", label: "Đã đặt lịch" },
    { value: "PENDING_CHANGE", label: "Chờ duyệt đổi lịch" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "INPROGRESS", label: "Đang điều trị" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "CANCELLED", label: "Hủy" },
  ];

  // ===== USEEFFECT: LẤY THÔNG TIN BÁC SĨ =====
  // useEffect này chạy khi component mount để lấy thông tin bác sĩ hiện tại
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        // Gọi API lấy thông tin bác sĩ từ token
        const res = await authService.getMyInfo();
        const id = res?.data?.result?.id;
        if (id) {
          setDoctorId(id);  // Lưu ID bác sĩ vào state
        } else {
          // Nếu không lấy được ID, hiển thị lỗi và quay lại trang trước
          showNotification("Không thể lấy thông tin bác sĩ", "error");
          navigate(-1);
        }
      } catch (error) {
        // Xử lý lỗi khi gọi API
        showNotification("Không thể lấy thông tin bác sĩ", "error");
        navigate(-1);
      }
    };
    fetchDoctorInfo();
  }, [navigate, showNotification]);

  // ===== USEEFFECT: TẢI DỮ LIỆU ĐIỀU TRỊ =====
  // useEffect này chạy sau khi có doctorId để tải dữ liệu điều trị
  useEffect(() => {
    const fetchData = async () => {
      // Kiểm tra điều kiện: cần có doctorId và chưa load dữ liệu
      if (!doctorId || dataLoadedRef.current) return;

      dataLoadedRef.current = true;  // Đánh dấu đã load để tránh load trùng lặp

      try {
        // Lấy dữ liệu từ location.state (được truyền từ PatientList)
        const {
          patientInfo,           // Thông tin bệnh nhân
          treatmentData: passedTreatmentData,  // Dữ liệu điều trị
          appointmentData,       // Dữ liệu lịch hẹn
        } = location.state || {};
        
        // Kiểm tra có thông tin bệnh nhân không
        if (!patientInfo) {
          showNotification("Không tìm thấy thông tin bệnh nhân", "warning");
          navigate(-1);
          return;
        }

        console.log("📋 Received data from PatientList:", {
          patientInfo,
          treatmentData: passedTreatmentData,
          appointmentData,
        });

        // Xử lý dữ liệu điều trị được truyền từ PatientList
        if (passedTreatmentData && passedTreatmentData.id) {
          // Kiểm tra xem có đầy đủ steps không
          if (
            passedTreatmentData.treatmentSteps &&
            passedTreatmentData.treatmentSteps.length > 0
          ) {
            // Nếu đã có đủ steps thì sử dụng luôn
            setTreatmentData(passedTreatmentData);
            setLoading(false);
            return;
          } else {
            // Nếu thiếu steps, gọi API để lấy chi tiết đầy đủ
            console.log(
              "⚠️ TreatmentData missing steps, calling API to get details..."
            );
            const detailedResponse =
              await treatmentService.getTreatmentRecordById(
                passedTreatmentData.id
              );
            const detailedData = detailedResponse?.data?.result;
            if (detailedData) {
              setTreatmentData(detailedData);
              setLoading(false);
              return;
            } else {
              // Nếu API thất bại, vẫn sử dụng dữ liệu ban đầu
              setTreatmentData(passedTreatmentData);
              setLoading(false);
              return;
            }
          }
        }

        // Nếu không có treatmentData từ PatientList, báo lỗi
        showNotification(
          "Không nhận được dữ liệu điều trị từ danh sách bệnh nhân",
          "error"
        );
        navigate(-1);
      } catch (error) {
        showNotification("Không thể lấy thông tin điều trị", "error");
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId]); // Chỉ phụ thuộc vào doctorId

  // ===== UTILITY FUNCTIONS - HÀM TIỆN ÍCH =====
  
  // Hàm lấy màu sắc cho trạng thái của treatment step
  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":      // Đã xác nhận
        return "processing";
      case "PLANED":         // Đã lên lịch  
        return "warning";
      case "COMPLETED":      // Hoàn thành
        return "success";
      case "CANCELLED":      // Đã hủy
        return "error";
      case "INPROGRESS":     // Đang điều trị
        return "orange";
      default:
        return "processing";
    }
  };

  // Hàm lấy text hiển thị cho trạng thái của treatment step
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
        return "Đang điều trị";
      case "PENDING_CHANGE":
        return "Chờ duyệt đổi lịch";
      default:
        return status;
    }
  };

  // Hàm lấy màu sắc cho trạng thái của appointment (lịch hẹn)
  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case "PENDING":        // Chờ xử lý
        return "orange";
      case "CONFIRMED":      // Đã xác nhận
        return "blue";
      case "COMPLETED":      // Hoàn thành
        return "green";
      case "CANCELLED":      // Đã hủy
        return "red";
      case "PLANED":         // Đã lên lịch
        return "yellow";
      case "PENDING_CHANGE": // Chờ duyệt đổi lịch
        return "gold";
      case "REJECTED":       // Từ chối
        return "volcano";
      default:
        return "default";
    }
  };

  // Hàm lấy text hiển thị cho trạng thái của appointment (lịch hẹn)
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

  // ===== HANDLER FUNCTIONS - CÁC HÀM XỬ LÝ CHÍNH =====
  
  // Hàm cập nhật treatment step - Được gọi khi submit form chỉnh sửa step
  const handleUpdateStep = async (values) => {
    if (!editingStep) return;  // Kiểm tra có step đang edit không
    
    try {
      // Chuẩn bị dữ liệu cập nhật từ form values
      const updateData = {
        stageId: editingStepStageId,     // ID của giai đoạn
        startDate: values.startDate      // Ngày bắt đầu (format YYYY-MM-DD)
          ? values.startDate.format("YYYY-MM-DD")
          : undefined,
        endDate: values.endDate          // Ngày kết thúc (format YYYY-MM-DD)
          ? values.endDate.format("YYYY-MM-DD")
          : undefined,
        status: values.status,           // Trạng thái mới
        notes: values.notes,             // Ghi chú
      };
      
      // Gọi API cập nhật treatment step
      const response = await treatmentService.updateTreatmentStep(
        editingStep.id,  // ID của step cần cập nhật
        updateData       // Dữ liệu cập nhật
      );
      console.log("🔍 Update response:", response);
      console.log("🔍 Response code:", response?.code || response?.data?.code);

      // Kiểm tra response thành công (code 1000)
      if (response?.code === 1000 || response?.data?.code === 1000) {
        console.log("✅ Update successful, refreshing data...");

        // BƯỚC 1: Thử lấy treatment record chi tiết để refresh data
        try {
          const detailedResponse =
            await treatmentService.getTreatmentRecordById(treatmentData.id);
          const detailedData = detailedResponse?.data?.result;

          console.log("🔍 Detailed response after update:", detailedResponse);
          console.log("🔍 Detailed data after update:", detailedData);

          // Nếu có dữ liệu chi tiết với steps
          if (detailedData && detailedData.treatmentSteps) {
            console.log("✅ Setting updated treatment data:", detailedData);
            setTreatmentData(detailedData);  // Cập nhật state với dữ liệu mới
          } else {
            // BƯỚC 2: Fallback - Nếu không có steps, dùng phương pháp cũ
            console.warn("❌ Treatment record không có steps sau khi update");
            
            // Lấy danh sách treatment records của doctor
            const updatedResponse =
              await treatmentService.getTreatmentRecordsByDoctor(doctorId);

            // Xử lý response có thể có nhiều format khác nhau
            let treatmentRecords = [];
            if (Array.isArray(updatedResponse)) {
              treatmentRecords = updatedResponse;
            } else if (updatedResponse?.data?.result) {
              if (Array.isArray(updatedResponse.data.result)) {
                treatmentRecords = updatedResponse.data.result;
              } else if (
                updatedResponse.data.result.content &&
                Array.isArray(updatedResponse.data.result.content)
              ) {
                treatmentRecords = updatedResponse.data.result.content;
              }
            }

            // Tìm record được cập nhật trong danh sách
            if (treatmentRecords && treatmentRecords.length > 0) {
              const updatedRecord = treatmentRecords.find(
                (record) => record.id === treatmentData.id
              );
              if (updatedRecord) {
                console.log(
                  "✅ Setting updated record from list:",
                  updatedRecord
                );
                setTreatmentData(updatedRecord);  // Cập nhật state
              }
            }
          }
        } catch (refreshError) {
          // BƯỚC 3: Fallback cuối cùng nếu bước 1 thất bại
          console.warn("❌ Không thể refresh data:", refreshError);
          
          // Lặp lại logic fallback (tương tự bước 2)
          const updatedResponse =
            await treatmentService.getTreatmentRecordsByDoctor(doctorId);

          let treatmentRecords = [];
          if (Array.isArray(updatedResponse)) {
            treatmentRecords = updatedResponse;
          } else if (updatedResponse?.data?.result) {
            if (Array.isArray(updatedResponse.data.result)) {
              treatmentRecords = updatedResponse.data.result;
            } else if (
              updatedResponse.data.result.content &&
              Array.isArray(updatedResponse.data.result.content)
            ) {
              treatmentRecords = updatedResponse.data.result.content;
            }
          }

          if (treatmentRecords && treatmentRecords.length > 0) {
            const updatedRecord = treatmentRecords.find(
              (record) => record.id === treatmentData.id
            );
            if (updatedRecord) {
              console.log(
                "✅ Setting updated record from fallback:",
                updatedRecord
              );
              setTreatmentData(updatedRecord);  // Cập nhật state từ fallback
            }
          }
        }

        // Đóng modal edit và reset form sau khi cập nhật thành công
        setEditingStep(null);           // Clear step đang edit
        form.resetFields();             // Reset form về trạng thái ban đầu
        setEditingStepStageId(null);    // Clear stage ID
        showNotification("Cập nhật thành công", "success");  // Hiển thị thông báo thành công
      } else {
        // Xử lý khi API trả về code không phải 1000 (thất bại)
        console.warn(
          "❌ Update failed - invalid response code:",
          response?.code || response?.data?.code
        );
        showNotification("Cập nhật thất bại", "error");
      }
    } catch (error) {
      // Xử lý lỗi exception
      showNotification(error.response?.data.message, "error");
    }
  };

  // Hàm tạo lịch hẹn mới - Được gọi khi submit form tạo appointment
  const handleScheduleAppointment = async (values) => {
    try {
      // Tìm step object từ treatmentData dựa vào treatmentStepId
      const stepObj = treatmentData.treatmentSteps.find(
        (step) => String(step.id) === String(values.treatmentStepId)
      );

      // Chuẩn bị dữ liệu appointment từ form values
      const appointmentData = {
        customerId: treatmentData.customerId,                    // ID bệnh nhân
        doctorId: doctorId,                                      // ID bác sĩ
        appointmentDate: values.appointmentDate.format("YYYY-MM-DD"), // Ngày hẹn
        shift: values.shift,                                     // Ca khám (MORNING/AFTERNOON)
        purpose: values.purpose,                                 // Mục đích khám (từ form)
        notes: values.notes,                                     // Ghi chú
        treatmentStepId: values.treatmentStepId,                 // ID của treatment step
      };
      
      // Gọi API tạo appointment
      const response = await treatmentService.createAppointment(
        appointmentData
      );
      
      // Kiểm tra response thành công
      if (response?.data?.code === 1000) {
        showNotification("Tạo lịch hẹn thành công", "success");

        // Đóng modal và reset form sau khi tạo thành công
        setShowCreateAppointmentModal(false);
        scheduleForm.resetFields();

        // Note: Không mở lại modal xem lịch hẹn, chỉ hiển thị thông báo thành công
      } else {
        // Xử lý khi API trả về lỗi
        showNotification(
          response?.data?.message || "Tạo lịch hẹn thất bại",
          "error"
        );
      }
    } catch (error) {
      // Xử lý lỗi exception
      showNotification(error.response.data.message, "error");
    }
  };

  // Hàm hiển thị modal chỉnh sửa step - Được gọi khi click nút Edit
  const showEditModal = async (step) => {
    setEditingStep(step);  // Set step đang được edit
    
    // Lấy chi tiết treatment step từ API để có đầy đủ thông tin
    try {
      const res = await treatmentService.getTreatmentStepById(step.id);
      const detail = res?.data?.result;
      
      // Set stage ID từ API response
      setEditingStepStageId(detail?.treatmentStageId);
      
      // Điền dữ liệu vào form với xử lý đặc biệt cho status CONFIRMED
      form.setFieldsValue({
        startDate: detail?.startDate ? dayjs(detail.startDate) : null,
        endDate: detail?.endDate ? dayjs(detail.endDate) : null,
        status: detail?.status === "CONFIRMED" ? undefined : detail?.status,  // CONFIRMED sẽ hiển thị placeholder
        notes: detail?.notes,
      });
    } catch {
      // Fallback: Nếu API thất bại, sử dụng dữ liệu từ step object
      setEditingStepStageId(step.stageId);
      form.setFieldsValue({
        startDate: step.startDate ? dayjs(step.startDate) : null,
        endDate: step.endDate ? dayjs(step.endDate) : null,
        status: step.status === "CONFIRMED" ? undefined : step.status,
        notes: step.notes,
      });
    }
  };

  // Hàm hiển thị modal tạo lịch hẹn mới - Được gọi từ modal chi tiết step
  const handleShowCreateAppointment = () => {
    console.log(
      "🔍 handleShowCreateAppointment called with selectedStep:",
      selectedStep
    );
    
    // Đóng modal chi tiết và mở modal tạo appointment
    setShowStepDetailModal(false);
    setShowCreateAppointmentModal(true);
    
    // Reset form và điền giá trị mặc định
    scheduleForm.resetFields();
    scheduleForm.setFieldsValue({
      treatmentStepId: selectedStep?.id,  // ID của step được chọn
      shift: "MORNING",                   // Ca mặc định là sáng
    });
  };

  // Hàm mở modal xem lịch hẹn - Được gọi khi click nút "Xem lịch hẹn"
  const handleShowScheduleModal = async (step) => {
    setScheduleStep(step);           // Set step để xem lịch
    setShowScheduleModal(true);      // Hiển thị modal
    setLoadingAppointments(true);    // Bắt đầu loading
    
    try {
      // Gọi API lấy lịch hẹn của step
      const response = await treatmentService.getAppointmentsByStepId(step.id);
      const appointments = response?.data?.result || [];
      setStepAppointments(appointments);
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      setStepAppointments([]);  // Fallback nếu lỗi
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Hàm xử lý submit ghi chú - Được gọi khi cập nhật status COMPLETED hoặc CANCELLED
  const handleNoteSubmit = async () => {
    if (!note.trim()) {
      showNotification("Vui lòng nhập ghi chú!", "warning");
      return;
    }

    if (!pendingStatusUpdate) return;  // Không có update nào đang pending

    const { appointmentId, newStatus } = pendingStatusUpdate;

    try {
      // Gọi API cập nhật status với ghi chú
      const res = await treatmentService.updateAppointmentStatus(
        appointmentId,
        newStatus,
        note  // Truyền note làm tham số thứ 3
      );
      
      if (res?.data?.code === 1000) {
        showNotification("Cập nhật trạng thái thành công", "success");
        setShowScheduleModal(false);
        
        // Cập nhật local state
        setStepAppointments((prev) =>
          Array.isArray(prev)
            ? prev.map((a) =>
                a.id === appointmentId
                  ? { ...a, status: newStatus, showStatusSelect: false }
                  : a
              )
            : []
        );
      } else {
        showNotification(res?.data?.message || "Cập nhật thất bại", "error");
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Lỗi cập nhật", "error");
    } finally {
      // Cleanup: đóng modal và reset state
      setShowNoteModal(false);
      setPendingStatusUpdate(null);
      setNote("");
    }
  };

  // ===== CÁC HÀM XỬ LÝ DỊCH VỤ VÀ TRẠNG THÁI =====
  
  // Hàm mở modal đổi dịch vụ và tải danh sách dịch vụ
  const handleShowChangeService = async () => {
    setShowChangeServiceModal(true);  // Hiển thị modal
    
    try {
      // Gọi API lấy danh sách tất cả dịch vụ có thể chọn
      const res = await treatmentService.getAllServicesForSelect();
      if (res?.data?.result) {
        setServiceOptions(res.data.result);  // Cập nhật danh sách dịch vụ
      } else {
        setServiceOptions([]);  // Fallback nếu không có dịch vụ
      }
    } catch {
      setServiceOptions([]);  // Fallback nếu API lỗi
    }
  };

  // Hàm xác nhận đổi dịch vụ - Được gọi khi click "Xác nhận" trong modal
  const handleChangeService = async () => {
    if (!selectedServiceId) return;  // Phải chọn dịch vụ trước
    
    try {
      // Gọi API cập nhật dịch vụ cho treatment record
      await treatmentService.updateTreatmentRecordService(
        treatmentData.id,        // ID của treatment record
        selectedServiceId        // ID dịch vụ mới được chọn
      );
      
      showNotification("Đã chọn dịch vụ thành công!", "success");
      
      // Cleanup modal state
      setShowChangeServiceModal(false);
      setSelectedServiceId(null);
      
      // Reload treatment record để cập nhật thông tin dịch vụ mới
      const detail = await treatmentService.getTreatmentRecordById(
        treatmentData.id
      );
      setTreatmentData(detail?.data?.result);  // Cập nhật state với dữ liệu mới
    } catch {
      showNotification("Đổi dịch vụ thất bại!", "error");
    }
  };

  // Hàm khởi tạo hủy dịch vụ - Mở modal xác nhận hủy
  const handleCancelService = (treatment) => {
    setSelectedTreatment(treatment);  // Set treatment cần hủy
    setIsModalVisible(true);          // Hiển thị modal xác nhận
  };

  // Hàm xác nhận hủy treatment record - Được gọi khi click "Hủy hồ sơ"
  const handleOk = async () => {
    if (!cancelReason.trim()) {
      showNotification("Vui lòng nhập lý do huỷ!", "warning");
      return;
    }
    
    setCancelLoading(true);  // Bắt đầu loading
    try {
      // Gọi API hủy treatment record với lý do
      await treatmentService.cancelTreatmentRecord(
        selectedTreatment.id,    // ID của treatment record
        cancelReason             // Lý do hủy
      );
      
      showNotification("Hủy hồ sơ thành công!", "success");
      
      // Cleanup modal state
      setIsModalVisible(false);
      setCancelReason("");
      
      // Reload trang sau 800ms để người dùng thấy thông báo thành công
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      showNotification(err.response?.data?.message, "error");
    } finally {
      setCancelLoading(false);  // Tắt loading
    }
  };

  // Hàm hủy modal hủy treatment - Đóng modal mà không thực hiện hành động
  const handleCancel = () => {
    setIsModalVisible(false);
    setCancelReason("");
  };

  // Hàm cập nhật trạng thái treatment - Xử lý đặc biệt cho status COMPLETED
  const handleUpdateTreatmentStatus = async (status) => {
    // Nếu status là COMPLETED, cần chọn kết quả trước
    if (status === "COMPLETED") {
      setShowResultModal(true);         // Hiển thị modal chọn kết quả
      setPendingCompleteStatus(status); // Lưu status pending
      return;
    }
    
    try {
      // Gọi API cập nhật trạng thái treatment
      const response = await treatmentService.updateTreatmentStatus(
        treatmentData.id,  // ID của treatment record
        status             // Trạng thái mới
      );
      
      if (response?.data?.code === 1000 || response?.code === 1000) {
        showNotification("Cập nhật trạng thái dịch vụ thành công", "success");
        
        // Refresh data để hiển thị trạng thái mới
        try {
          const detailedResponse =
            await treatmentService.getTreatmentRecordById(treatmentData.id);
          const detailedData = detailedResponse?.data?.result;
          if (detailedData) setTreatmentData(detailedData);
        } catch {}  // Ignore refresh errors
      } else {
        showNotification(
          response?.data?.message || "Cập nhật trạng thái dịch vụ thất bại",
          "error"
        );
      }
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Cập nhật trạng thái dịch vụ thất bại",
        "error"
      );
    }
  };

  // Hàm xác nhận hoàn thành với kết quả - Được gọi từ modal chọn kết quả
  const handleConfirmCompleteWithResult = async () => {
    if (!selectedResult) {
      showNotification("Vui lòng chọn kết quả cuối cùng!", "warning");
      return;
    }
    
    try {
      // Gọi API cập nhật trạng thái COMPLETED với kết quả
      const response = await treatmentService.updateTreatmentStatus(
        treatmentData.id,    // ID của treatment record
        "COMPLETED",         // Trạng thái
        selectedResult       // Kết quả: SUCCESS hoặc FAILURE
      );
      
      if (response?.data?.code === 1000 || response?.code === 1000) {
        showNotification("Hoàn thành điều trị thành công", "success");
        
        // Cleanup modal state
        setShowResultModal(false);
        setSelectedResult(null);
        setPendingCompleteStatus(null);
        
        // Refresh data để hiển thị trạng thái và kết quả mới
        try {
          const detailedResponse =
            await treatmentService.getTreatmentRecordById(treatmentData.id);
          const detailedData = detailedResponse?.data?.result;
          if (detailedData) setTreatmentData(detailedData);
        } catch {}  // Ignore refresh errors
      } else {
        showNotification(
          response?.data?.message || "Cập nhật trạng thái dịch vụ thất bại",
          "error"
        );
      }
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Cập nhật trạng thái dịch vụ thất bại",
        "error"
      );
    }
  };

  // ===== USEEFFECT: TẢI STAGE OPTIONS KHI MỞ MODAL THÊM STEP =====
  // useEffect này chạy khi showAddStepModal thay đổi để tải danh sách giai đoạn có thể chọn
  useEffect(() => {
    // Khi mở modal thêm step và có treatmentServiceId
    if (showAddStepModal && treatmentData?.treatmentServiceId) {
      // Gọi API lấy danh sách stages có thể chọn theo serviceId
      treatmentService
        .getSelectableStagesByServiceId(treatmentData.treatmentServiceId)
        .then((res) => {
          const allStages = res?.data?.result || [];
          
          // Lấy danh sách stageId đã được sử dụng trong treatmentSteps hiện tại
          const usedStageIds = treatmentData?.treatmentSteps?.map(step => 
            step.treatmentStageId || step.stageId
          ) || [];
          
          console.log("🔍 All available stages:", allStages);
          console.log("🔍 Used stage IDs:", usedStageIds);
          
          // Filter ra những stages chưa được sử dụng
          const availableStages = allStages.filter(stage => 
            !usedStageIds.includes(stage.id)
          );
          
          console.log("✅ Available stages after filtering:", availableStages);
          
          // Hiển thị thông báo nếu không còn stage nào có thể thêm
          if (availableStages.length === 0 && allStages.length > 0) {
            setAllStagesUsed(true);  // Set flag tất cả stages đã dùng
            showNotification(
              "Tất cả các bước điều trị đã được tạo cho dịch vụ này", 
              "info"
            );
          } else {
            setAllStagesUsed(false); // Reset flag khi còn stages có thể dùng
          }
          
          setStageOptions(availableStages);  // Chỉ set những stages chưa dùng
        })
        .catch(() => setStageOptions([]));  // Fallback nếu API lỗi
    }
    
    // Khi đóng modal, cleanup state
    if (!showAddStepModal) {
      setAddStepAuto(false);      // Reset switch tự động tạo lịch hẹn
      setStageOptions([]);        // Clear danh sách stages
      addStepForm.resetFields();  // Reset form
      setAllStagesUsed(false);    // Reset flag tất cả stages đã dùng
    }
  }, [showAddStepModal, treatmentData?.treatmentServiceId, treatmentData?.treatmentSteps]);

  // ===== USEEFFECT: TỰ ĐỘNG CẬP NHẬT SELECTED STEP =====
  // useEffect này đảm bảo selectedStep luôn có dữ liệu mới nhất khi treatmentData thay đổi
  useEffect(() => {
    // Nếu có selectedStep và treatmentData có steps
    if (selectedStep && treatmentData?.treatmentSteps) {
      // Tìm step updated từ treatmentData dựa vào ID
      const updatedStep = treatmentData.treatmentSteps.find(
        (step) => String(step.id) === String(selectedStep.id)
      );
      
      // Nếu tìm thấy và có sự thay đổi, cập nhật selectedStep
      if (
        updatedStep &&
        JSON.stringify(updatedStep) !== JSON.stringify(selectedStep)
      ) {
        console.log("🔄 Updating selectedStep with new data:", updatedStep);
        setSelectedStep(updatedStep);  // Cập nhật selectedStep với dữ liệu mới
      }
    }
  }, [treatmentData, selectedStep]);

  // Hàm utility: chuyển đổi mã kết quả thành text hiển thị tiếng Việt
  const getResultText = (result) => {
    switch ((result || "").toUpperCase()) {
      case "SUCCESS":
        return "Thành công";    // Điều trị thành công
      case "FAILURE":
        return "Thất bại";      // Điều trị thất bại  
      case "UNDETERMINED":
        return "Đang kiểm tra"; // Kết quả chưa rõ ràng
      default:
        return "Chưa có";       // Chưa có kết quả
    }
  };

  // ===== RENDER LOADING STATE =====
  // Nếu đang loading, hiển thị spinner toàn màn hình
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",          // Chiều cao toàn màn hình
          background: "#fff",       // Nền trắng
          overflow: "hidden",       // Ẩn scrollbar
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div
      style={{
        minHeight: "100vh",        // Chiều cao tối thiểu toàn màn hình
        background: "#fff",        // Nền trắng
        padding: "32px 0",         // Padding trên dưới
        overflow: "hidden",        // Ẩn scrollbar
        display: "flex",
        flexDirection: "column",   // Layout dọc
        alignItems: "center",      // Căn giữa theo chiều ngang
        justifyContent: "flex-start", // Căn đầu theo chiều dọc
      }}
    >
      {/* ===== HEADER SECTION - Nút quay lại ===== */}
      <Card
        style={{
          marginBottom: "24px",
          borderRadius: 14,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          background: "#fff",
          width: "100%",
          maxWidth: "1200px",      // Giới hạn chiều rộng tối đa
          minWidth: 320,           // Chiều rộng tối thiểu cho mobile
          padding: 0,
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}     // Quay lại trang trước
              style={{ borderRadius: 8, height: 40 }}
              size="large"
            >
              Quay lại
            </Button>
          </Col>
        </Row>
      </Card>

      {/* ===== MAIN CONTENT - Hiển thị khi có dữ liệu ===== */}
      {treatmentData ? (
        <>
          {/* ===== TREATMENT INFO & TIMELINE SECTION ===== */}
          <Card
            style={{
              borderRadius: 14,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              background: "#fff",
              width: "100%",
              maxWidth: "1200px",
              minWidth: 320,
              marginBottom: "24px",
              padding: "24px 0 8px 0",
            }}
          >
            {/* ===== PATIENT INFO SECTION - Thông tin bệnh nhân ===== */}
            <div
              style={{
                padding: "0 24px 24px 24px",
                borderBottom: "1px solid #f0f0f0",  // Đường kẻ phân cách
                marginBottom: 24,
              }}
            >
              <Title level={4} style={{ color: "#1890ff", marginBottom: 16 }}>
                Thông tin bệnh nhân
              </Title>
              
              {/* Grid layout hiển thị thông tin bệnh nhân */}
              <Row gutter={[24, 16]}>
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
                <Col xs={24} md={12}>
                  <Space>
                    <Text strong>Bác sĩ:</Text>
                    <Text>{treatmentData.doctorName}</Text>
                  </Space>
                </Col>
                <Col xs={24} md={12}>
                  <Space>
                    <Text strong>Dịch vụ:</Text>
                    <Text>{treatmentData.treatmentServiceName}</Text>
                  </Space>
                </Col>
                <Col xs={24} md={12}>
                  <Space>
                    <Text strong>Ngày đầu chu kì:</Text>
                    <Text>
                      {dayjs(treatmentData.cd1Date).format("DD/MM/YYYY")}
                    </Text>
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
            </div>

            {/* ===== ACTION BUTTONS SECTION - Các nút hành động ===== */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 16,
                padding: "0 24px",
              }}
            >
              {/* Nút thêm bước điều trị mới */}
              <Tooltip
                title={
                  allStagesUsed 
                    ? "Tất cả các bước điều trị đã được tạo cho dịch vụ này" 
                    : "Thêm bước điều trị mới vào quy trình"
                }
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setShowAddStepModal(true)}
                  disabled={allStagesUsed}
                  size="large"
                  style={{ 
                    borderRadius: 8, 
                    minWidth: 180,
                    opacity: allStagesUsed ? 0.6 : 1,
                    cursor: allStagesUsed ? "not-allowed" : "pointer"
                  }}
                >
                  {allStagesUsed ? "Đã tạo hết các bước" : "Thêm bước điều trị mới"}
                </Button>
              </Tooltip>
              
              {/* Dropdown menu cập nhật trạng thái dịch vụ */}
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "INPROGRESS",
                      label: "Đang điều trị",
                      onClick: () => handleUpdateTreatmentStatus("INPROGRESS"),
                    },
                    {
                      key: "COMPLETED",
                      label: "Hoàn thành",
                      onClick: () => handleUpdateTreatmentStatus("COMPLETED"),
                    },
                    {
                      key: "CANCELLED",
                      label: "Hủy",
                      onClick: () => handleCancelService(treatmentData),
                      danger: true,  // Hiển thị màu đỏ
                    },
                  ],
                }}
                placement="bottomLeft"
              >
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  size="large"
                  style={{ borderRadius: 8, minWidth: 180 }}
                >
                  Cập nhật trạng thái dịch vụ
                </Button>
              </Dropdown>
            </div>

            {/* ===== TREATMENT STEPS TIMELINE ===== */}
            {treatmentData.treatmentSteps &&
            treatmentData.treatmentSteps.length > 0 ? (
              <Card
                title={
                  <span
                    style={{ fontWeight: 700, fontSize: 20, color: "#1890ff" }}
                  >
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
                            {index + 1}
                          </span>
                        </div>
                      }
                    >
                      <Card
                        size="small"
                        style={{
                          marginBottom: 24,
                          borderRadius: 16,
                          boxShadow: "0 2px 8px rgba(24,144,255,0.08)",
                          background: index === 0 ? "#fafdff" : "#fff",
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
                              <Button
                                type="default"
                                icon={<EditOutlined />}
                                style={{
                                  borderRadius: 8,
                                  fontWeight: 600,
                                  minWidth: 140,
                                }}
                                onClick={() => showEditModal(step)}
                              >
                                Cập nhật
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
              // ===== EMPTY STATE - Khi chưa có bước điều trị =====
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
          {/* ===== COMPLETE TREATMENT BUTTON - ĐÃ XÓA ===== */}
        </>
      ) : (
        // ===== ERROR STATE - Không tìm thấy dữ liệu =====
        <Card
          style={{
            borderRadius: 14,
            textAlign: "center",
            background: "#fff",
            width: 800,
            maxWidth: "98vw",        // Responsive cho mobile
            minWidth: 320,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Title level={4}>Không tìm thấy thông tin điều trị</Title>
          <Text>
            Vui lòng kiểm tra lại thông tin bệnh nhân hoặc thử lại sau.
          </Text>
        </Card>
      )}

      {/* ===== TẤT CẢ CÁC MODAL COMPONENTS ===== */}
      {/* Từ đây trở xuống là các Modal components để hiển thị các popup dialog */}
      
      {/* ===== STEP DETAIL MODAL ===== */}
      {/* Modal hiển thị chi tiết của một treatment step */}
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            <ExperimentOutlined
              style={{ fontSize: 24, color: "#1890ff", marginRight: 8 }}
            />
            Chi Tiết Bước Điều Trị
          </div>
        }
        open={showStepDetailModal}
        onCancel={() => {
          setShowStepDetailModal(false);
          setSelectedStep(null);
        }}
        footer={null}
        width={600}
        centered
      >
        {selectedStep && (
          <div style={{ padding: "32px 0" }}>
            <Card
              style={{
                marginBottom: 0,
                borderRadius: 16,
                width: "100%",
                padding: 32,
              }}
            >
              <Title level={4} style={{ color: "#1890ff", marginBottom: 16 }}>
                {selectedStep.name}
              </Title>
              <Row gutter={24}>
                <Col span={12}>
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Trạng thái:</Text>
                    <br />
                    <Tag
                      color={getStatusColor(selectedStep.status)}
                      style={{ marginTop: 4 }}
                    >
                      {getStatusText(selectedStep.status)}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Ghi chú:</Text>
                    <br />
                    <Text style={{ marginTop: 4 }}>
                      {selectedStep.notes || "Không có ghi chú"}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 12 }}>
                    <Text strong>Ngày bắt đầu:</Text>
                    <br />
                    <Text style={{ marginTop: 4 }}>
                      {selectedStep.startDate
                        ? dayjs(selectedStep.startDate).format("DD/MM/YYYY")
                        : "Chưa có"}
                    </Text>
                  </div>
                  <div>
                    <Text strong>Ngày kết thúc:</Text>
                    <br />
                    <Text style={{ marginTop: 4 }}>
                      {selectedStep.endDate
                        ? dayjs(selectedStep.endDate).format("DD/MM/YYYY")
                        : "Chưa có"}
                    </Text>
                  </div>
                </Col>
              </Row>
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setShowStepDetailModal(false);
                    showEditModal(selectedStep);
                  }}
                  size="large"
                  style={{ borderRadius: 8, minWidth: 120, marginRight: 16 }}
                >
                  Cập nhật
                </Button>
                <Button
                  type="default"
                  icon={<FileTextOutlined />}
                  onClick={() => {
                    setShowStepDetailModal(false);
                    handleShowScheduleModal(selectedStep);
                  }}
                  size="large"
                  style={{ borderRadius: 8, minWidth: 120, marginRight: 16 }}
                >
                  Xem lịch hẹn
                </Button>
                <Button
                  type="default"
                  icon={<ExperimentOutlined />}
                  onClick={() => {
                    setShowStepDetailModal(false);
                    handleShowLabTestModal(selectedStep);
                  }}
                  size="large"
                  style={{ 
                    borderRadius: 8, 
                    minWidth: 120, 
                    marginRight: 16,
                    background: "#e6f7ff",
                    borderColor: "#1890ff",
                    color: "#1890ff",
                  }}
                >
                  Xét nghiệm
                </Button>
                <Button
                  type="default"
                  icon={<CalendarOutlined />}
                  onClick={() => {
                    setShowStepDetailModal(false);
                    setSelectedStep(selectedStep);
                    handleShowCreateAppointment();
                  }}
                  size="large"
                  style={{ borderRadius: 8, minWidth: 120 }}
                >
                  Tạo lịch hẹn
                </Button>
              </div>
            </Card>
          </div>
        )}
      </Modal>

      {/* ===== UPDATE STEP MODAL ===== */}
      {/* Modal chỉnh sửa thông tin treatment step */}
      <Modal
        title="Cập nhật thông tin điều trị"
        open={!!editingStep}
        onCancel={() => {
          setEditingStep(null);
          form.resetFields();
          setEditingStepStageId(null);
        }}
        footer={null}
        width={500}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateStep}>
          <Form.Item name="startDate" label="Ngày bắt đầu">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="endDate" label="Ngày kết thúc">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Select.Option value="INPROGRESS">Đang điều trị</Select.Option>
              <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
              <Select.Option value="CANCELLED">Hủy</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  background:
                    editingStep?.status === "INPROGRESS"
                      ? "#fa8c16"
                      : "#1890ff",
                  borderColor:
                    editingStep?.status === "INPROGRESS"
                      ? "#fa8c16"
                      : "#1890ff",
                  color: "#fff",
                }}
              >
                Cập nhật
              </Button>
              <Button
                onClick={() => {
                  setEditingStep(null);
                  form.resetFields();
                  setEditingStepStageId(null);
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
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
          {loadingAppointments ? (
            // Hiển thị loading spinner khi đang tải appointments
            <div style={{ textAlign: "center", padding: 20 }}>
              <Spin size="large" />
            </div>
          ) : stepAppointments.length === 0 ? (
            // Hiển thị empty state khi không có appointments
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
              {/* ===== DANH SÁCH APPOINTMENTS - Hiển thị tối đa 3 appointments đầu tiên ===== */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  justifyContent: "center",
                }}
              >
                {Array.isArray(stepAppointments) &&
                  stepAppointments.slice(0, 3).map((app, idx) => {
                    const statusColor = getAppointmentStatusColor(app.status);
                    // Xác định icon theo trạng thái appointment
                    const statusIcon = (() => {
                      switch (app.status) {
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
                      // Card hiển thị thông tin appointment
                      <Card
                        key={app.id}
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
                        {/* Icon trạng thái ở góc phải trên */}
                        <div
                          style={{ position: "absolute", top: 10, right: 10 }}
                        >
                          {statusIcon}
                        </div>
                        
                        {/* Thông tin ngày hẹn */}
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>Ngày hẹn:</Text>
                          <br />
                          <Text>
                            {dayjs(app.appointmentDate).format("DD/MM/YYYY")}
                          </Text>
                        </div>
                        
                        {/* Thông tin ca khám */}
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>Ca khám:</Text>
                          <br />
                          <Tag color="cyan">
                            {app.shift === "MORNING"
                              ? "Sáng"
                              : app.shift === "AFTERNOON"
                              ? "Chiều"
                              : app.shift}
                          </Tag>
                        </div>
                        
                        {/* Trạng thái appointment */}
                        <div style={{ marginBottom: 8 }}>
                          <Text strong>Trạng thái:</Text>
                          <br />
                          <Tag color={statusColor}>
                            {getAppointmentStatusText(app.status)}
                          </Tag>
                        </div>
                        
                        {/* Ghi chú với ellipsis overflow */}
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
                            title={app.notes} // tooltip đầy đủ khi hover
                          >
                            {app.notes || "Không có ghi chú"}
                          </Text>
                        </div>
                        
                        {/* Mục đích appointment (nếu có) */}
                        {app.purpose && (
                          <div style={{ marginTop: 8 }}>
                            <Text strong>Mục đích:</Text>
                            <br />
                            <Text>{app.purpose}</Text>
                          </div>
                        )}
                        
                        {/* ===== NÚT CẬP NHẬT TRẠNG THÁI APPOINTMENT ===== */}
                        <div style={{ marginTop: 12, textAlign: "center" }}>
                          <Button
                            type="primary"
                            size="small"
                            style={{
                              background: "#fa8c16",
                              borderColor: "#fa8c16",
                              color: "#fff",
                              borderRadius: 6,
                              fontSize: 12,
                              height: 28,
                            }}
                            onClick={() =>
                              setStepAppointments((prev) =>
                                Array.isArray(prev)
                                  ? prev.map((a, i) =>
                                      i === idx
                                        ? {
                                            ...a,
                                            showStatusSelect:
                                              !a.showStatusSelect,
                                          }
                                        : a
                                    )
                                  : []
                              )
                            }
                          >
                            Cập nhật trạng thái
                          </Button>
                          
                          {/* Radio buttons để chọn trạng thái mới (chỉ hiển thị khi click nút) */}
                          {app.showStatusSelect && (
                            <div style={{ marginTop: 8 }}>
                              <Radio.Group
                                style={{ width: "100%" }}
                                value={app.status || undefined}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  // Nếu chọn COMPLETED hoặc CANCELLED, cần nhập ghi chú
                                  if (
                                    ["COMPLETED", "CANCELLED"].includes(
                                      newStatus
                                    )
                                  ) {
                                    setPendingStatusUpdate({
                                      appointmentId: app.id,
                                      newStatus,
                                    });
                                    setNote(""); // clear note cũ
                                    setShowNoteModal(true); // mở modal nhập note
                                  }
                                }}
                                buttonStyle="solid"
                                size="small"
                              >
                                {statusOptions
                                  .filter((opt) =>
                                    ["COMPLETED", "CANCELLED"].includes(
                                      opt.value
                                    )
                                  )
                                  .map((opt) => (
                                    <Radio.Button
                                      key={opt.value}
                                      value={opt.value}
                                      style={{
                                        margin: 2,
                                        width: "100%",
                                        fontSize: 11,
                                        height: 24,
                                      }}
                                    >
                                      {opt.label}
                                    </Radio.Button>
                                  ))}
                              </Radio.Group>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
              </div>

              {/* ===== HIỂN THỊ THÊM CÁC APPOINTMENTS CÒN LẠI ===== */}
              {Array.isArray(stepAppointments) &&
                stepAppointments.some((app) => app.showAll) && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 16,
                      justifyContent: "center",
                      marginTop: 16,
                    }}
                  >
                    {stepAppointments.slice(3).map((app, idx) => {
                      const statusColor = getAppointmentStatusColor(app.status);
                      const statusIcon = (() => {
                        switch (app.status) {
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
                          key={app.id}
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
                            style={{ position: "absolute", top: 10, right: 10 }}
                          >
                            {statusIcon}
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <Text strong>Ngày hẹn:</Text>
                            <br />
                            <Text>
                              {dayjs(app.appointmentDate).format("DD/MM/YYYY")}
                            </Text>
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <Text strong>Ca khám:</Text>
                            <br />
                            <Tag color="cyan">
                              {app.shift === "MORNING"
                                ? "Sáng"
                                : app.shift === "AFTERNOON"
                                ? "Chiều"
                                : app.shift}
                            </Tag>
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <Text strong>Trạng thái:</Text>
                            <br />
                            <Tag color={statusColor}>
                              {getAppointmentStatusText(app.status)}
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
                              title={app.notes} // tooltip đầy đủ khi hover
                            >
                              {app.notes || "Không có ghi chú"}
                            </Text>
                          </div>
                          {app.purpose && (
                            <div style={{ marginTop: 8 }}>
                              <Text strong>Mục đích:</Text>
                              <br />
                              <Text>{app.purpose}</Text>
                            </div>
                          )}
                          {/* Nút cập nhật trạng thái cho appointments từ thứ 4 trở đi */}
                          <div style={{ marginTop: 12, textAlign: "center" }}>
                            <Button
                              type="primary"
                              size="small"
                              style={{
                                background: "#fa8c16",
                                borderColor: "#fa8c16",
                                color: "#fff",
                                borderRadius: 6,
                                fontSize: 12,
                                height: 28,
                              }}
                              onClick={() =>
                                setStepAppointments((prev) =>
                                  Array.isArray(prev)
                                    ? prev.map((a, i) =>
                                        i === idx + 3
                                          ? {
                                              ...a,
                                              showStatusSelect:
                                                !a.showStatusSelect,
                                            }
                                          : a
                                      )
                                    : []
                                )
                              }
                            >
                              Cập nhật trạng thái
                            </Button>
                            {app.showStatusSelect && (
                              <div style={{ marginTop: 8 }}>
                                <Radio.Group
                                  style={{ width: "100%" }}
                                  value={app.status || undefined}
                                  onChange={(e) => {
                                    const newStatus = e.target.value;
                                    if (
                                      ["COMPLETED", "CANCELLED"].includes(
                                        newStatus
                                      )
                                    ) {
                                      setPendingStatusUpdate({
                                        appointmentId: app.id,
                                        newStatus,
                                      });
                                      setNote(""); // clear note cũ
                                      setShowNoteModal(true); // mở modal nhập note
                                    }
                                  }}
                                  buttonStyle="solid"
                                  size="small"
                                >
                                  {statusOptions
                                    .filter((opt) =>
                                      ["COMPLETED", "CANCELLED"].includes(
                                        opt.value
                                      )
                                    )
                                    .map((opt) => (
                                      <Radio.Button
                                        key={opt.value}
                                        value={opt.value}
                                        style={{
                                          margin: 2,
                                          width: "100%",
                                          fontSize: 11,
                                          height: 24,
                                        }}
                                      >
                                        {opt.label}
                                      </Radio.Button>
                                    ))}
                                </Radio.Group>
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}

              {/* ===== NÚT "XEM THÊM" HOẶC "ẨN BỚT" ===== */}
              {stepAppointments.length > 3 && (
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  {stepAppointments.some((app) => app.showAll) ? (
                    // Nút "Ẩn bớt" - chỉ hiển thị 3 appointments đầu
                    <Button
                      type="default"
                      icon={<FileTextOutlined />}
                      onClick={() => {
                        // Ẩn bớt - chỉ hiển thị 3 lịch hẹn đầu
                        setStepAppointments((prev) => {
                          if (Array.isArray(prev)) {
                            return prev.map((app) => ({
                              ...app,
                              showAll: false,
                            }));
                          }
                          return prev;
                        });
                      }}
                      style={{ borderRadius: 8, minWidth: 140 }}
                    >
                      Ẩn bớt
                    </Button>
                  ) : (
                    // Nút "Xem thêm" - hiển thị tất cả appointments
                    <Button
                      type="default"
                      icon={<FileTextOutlined />}
                      onClick={() => {
                        // Hiển thị tất cả lịch hẹn
                        setStepAppointments((prev) => {
                          if (Array.isArray(prev)) {
                            return prev.map((app) => ({
                              ...app,
                              showAll: true,
                            }));
                          }
                          return prev;
                        });
                      }}
                      style={{ borderRadius: 8, minWidth: 140 }}
                    >
                      Xem thêm ({stepAppointments.length - 3})
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
          
          {/* Nút tạo lịch hẹn mới ở cuối modal */}
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setShowScheduleModal(false);
                setSelectedStep(scheduleStep);
                handleShowCreateAppointment();
              }}
              size="large"
              style={{ borderRadius: 8, minWidth: 140 }}
            >
              Tạo lịch hẹn mới
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* ===== NOTE MODAL ===== */}
      {/* Modal nhập ghi chú khi cập nhật status appointment thành COMPLETED hoặc CANCELLED */}
      <Modal
        title="Nhập ghi chú"
        open={showNoteModal}
        onOk={handleNoteSubmit}
        onCancel={() => {
          setShowNoteModal(false);
          setPendingStatusUpdate(null);
          setNote("");
        }}
        okText="Lưu"
        cancelText="Huỷ"
      >
        <Input.TextArea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nhập ghi chú cho trạng thái này..."
        />
      </Modal>

      {/* ===== CREATE APPOINTMENT MODAL ===== */}
      {/* Modal tạo lịch hẹn mới cho treatment step */}
      {showCreateAppointmentModal && (
        <Modal
          title="Tạo lịch hẹn mới"
          open={showCreateAppointmentModal}
          onCancel={() => setShowCreateAppointmentModal(false)}
          footer={null}
          width={700}
          centered
        >
          <Form
            form={scheduleForm}
            layout="vertical"
            onFinish={handleScheduleAppointment}
            initialValues={{
              shift: "MORNING",                    // Ca mặc định
              treatmentStepId: selectedStep?.id,   // ID step được chọn
            }}
          >
            <Row gutter={16}>
              {/* Hiển thị tên bước điều trị (disabled input) */}
              <Col span={8}>
                <Form.Item label="Bước điều trị" required>
                  <Input value={selectedStep?.name} disabled />
                </Form.Item>
              </Col>
              {/* DatePicker chọn ngày hẹn */}
              <Col span={8}>
                <Form.Item
                  name="appointmentDate"
                  label="Ngày hẹn"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày hẹn" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              {/* Select chọn ca khám */}
              <Col span={8}>
                <Form.Item
                  name="shift"
                  label="Ca khám"
                  rules={[{ required: true, message: "Vui lòng chọn ca khám" }]}
                >
                  <Select>
                    <Select.Option value="MORNING">Sáng</Select.Option>
                    <Select.Option value="AFTERNOON">Chiều</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            {/* Input mục đích appointment */}
            <Form.Item
              name="purpose"
              label="Mục đích"
              rules={[{ required: true, message: "Vui lòng nhập mục đích" }]}
            >
              <Input placeholder="Nhập mục đích của lịch hẹn" />
            </Form.Item>
            
            {/* TextArea ghi chú */}
            <Form.Item name="notes" label="Ghi chú">
              <TextArea rows={2} />
            </Form.Item>
            
            {/* Hidden input lưu treatmentStepId */}
            <Form.Item
              name="treatmentStepId"
              initialValue={selectedStep?.id}
              hidden
            >
              <Input />
            </Form.Item>
            
            {/* Submit button */}
            <Form.Item style={{ textAlign: "right" }}>
              <Button type="primary" htmlType="submit">
                Tạo lịch hẹn
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}

      {/* ===== MODAL THÊM STEP ===== */}
      {/* Modal thêm treatment step mới vào treatment record */}
      <Modal
        title="Thêm bước điều trị mới"
        open={showAddStepModal}
        onCancel={() => setShowAddStepModal(false)}
        footer={null}
        width={400}
        centered
      >
        <Form
          form={addStepForm}
          layout="vertical"
          onFinish={async (values) => {
            setAddStepLoading(true);  // Bắt đầu loading
            try {
              // Chuẩn bị dữ liệu để tạo step mới
              const data = {
                treatmentRecordId: treatmentData.id,                    // ID treatment record
                stageId: values.stageId,                                // ID giai đoạn được chọn
                startDate: values.startDate                             // Ngày bắt đầu
                  ? values.startDate.format("YYYY-MM-DD")
                  : undefined,
                status: "CONFIRMED",                                    // Trạng thái mặc định
                notes: values.notes,                                    // Ghi chú
                auto: addStepAuto,                                      // Có tự động tạo appointment không
              };
              
              // Nếu chọn tự động tạo appointment, thêm thông tin appointment
              if (addStepAuto) {
                data.purpose = values.purpose;  // Mục đích appointment
                data.shift = values.shift;      // Ca khám
              }

              console.log("🔍 Creating treatment step with data:", data);
              
              // Gọi API tạo treatment step
              const response = await treatmentService.createTreatmentStep(data);
              console.log("🔍 Create treatment step response:", response);

              // Kiểm tra tạo thành công
              if (response?.data?.code === 1000 || response?.code === 1000) {
                showNotification("Đã thêm bước điều trị mới!", "success");
                
                // Đóng modal và reset form
                setShowAddStepModal(false);
                addStepForm.resetFields();

                // Reload treatment record để cập nhật danh sách steps
                try {
                  console.log(
                    "🔄 Reloading treatment record after creating step..."
                  );
                  const detail = await treatmentService.getTreatmentRecordById(
                    treatmentData.id
                  );
                  const detailData = detail?.data?.result;
                  console.log("🔍 Reloaded treatment data:", detailData);

                  if (detailData) {
                    setTreatmentData(detailData);
                    console.log("✅ Treatment data updated successfully");
                  } else {
                    console.warn("⚠️ No treatment data returned from reload");
                  }
                } catch (reloadError) {
                  console.error(
                    "❌ Error reloading treatment data:",
                    reloadError
                  );
                  showNotification(
                    "Đã thêm bước nhưng không thể cập nhật giao diện",
                    "warning"
                  );
                }
              }
            } catch (err) {
              console.error("❌ Error creating treatment step:", err);
              showNotification(err.response.data.message, "error");
            } finally {
              setAddStepLoading(false);  // Tắt loading
            }
          }}
        >
          {/* Select chọn giai đoạn điều trị */}
          <Form.Item
            name="stageId"
            label="Tên bước điều trị"
            rules={[{ required: true, message: "Chọn bước điều trị" }]}
          >
            <Select placeholder="Chọn bước điều trị">
              {stageOptions.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          {/* DatePicker chọn ngày bắt đầu */}
          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Chọn ngày dự kiến" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          
          {/* Switch bật/tắt tự động tạo lịch hẹn */}
          <Form.Item label="Tạo lịch hẹn:">
            <Switch checked={addStepAuto} onChange={setAddStepAuto} />
          </Form.Item>
          
          {/* Các field chỉ hiển thị khi bật switch tự động tạo lịch hẹn */}
          {addStepAuto && (
            <>
              <Form.Item
                name="purpose"
                label="Mục đích"
                rules={[{ required: true, message: "Nhập mục đích" }]}
              >
                <Input placeholder="Nhập mục đích" />
              </Form.Item>
              <Form.Item
                name="shift"
                label="Ca khám"
                rules={[{ required: true, message: "Chọn ca khám" }]}
              >
                <Select placeholder="Chọn ca khám">
                  <Select.Option value="MORNING">Sáng</Select.Option>
                  <Select.Option value="AFTERNOON">Chiều</Select.Option>
                </Select>
              </Form.Item>
            </>
          )}
          
          {/* TextArea ghi chú */}
          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={2} placeholder="Ghi chú (nếu có)" />
          </Form.Item>
          
          {/* Submit button */}
          <Form.Item style={{ textAlign: "right" }}>
            <Button type="primary" htmlType="submit" loading={addStepLoading}>
              Thêm bước
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* ===== MODAL CHỌN DỊCH VỤ PHÙ HỢP ===== */}
      {/* Modal cho phép bác sĩ đổi dịch vụ điều trị cho bệnh nhân */}
      <Modal
        title="Chọn dịch vụ phù hợp"
        open={showChangeServiceModal}
        onCancel={() => {
          setShowChangeServiceModal(false);
          setSelectedServiceId(null);
        }}
        onOk={handleChangeService}
        okText="Xác nhận"
        cancelText="Hủy"
        width={400}
        centered
      >
        <Select
          style={{ width: "100%" }}
          placeholder="Chọn dịch vụ..."
          value={selectedServiceId}
          onChange={setSelectedServiceId}
          options={serviceOptions.map((s) => ({
            value: s.id,
            label: `${s.name} - ${s.price?.toLocaleString()}đ`,  // Hiển thị tên và giá
          }))}
        />
      </Modal>

      {/* ===== MODAL CHỌN KẾT QUẢ ĐIỀU TRỊ CUỐI CÙNG ===== */}
      {/* Modal hiển thị khi bác sĩ chọn hoàn thành điều trị */}
      <Modal
        title="Chọn kết quả:"
        open={showResultModal}
        onCancel={() => {
          setShowResultModal(false);
          setSelectedResult(null);
          setPendingCompleteStatus(null);
        }}
        onOk={handleConfirmCompleteWithResult}
        okText="Xác nhận"
        cancelText="Hủy"
        destroyOnClose
      >
        <Radio.Group
          value={selectedResult}
          onChange={(e) => setSelectedResult(e.target.value)}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <Radio value="SUCCESS">Thành công </Radio>
          <Radio value="FAILURE">Thất bại</Radio>
        </Radio.Group>
      </Modal>

      {/* ===== MODAL HỦY HỒ SƠ ===== */}
      {/* Modal xác nhận hủy treatment record với lý do */}
      <Modal
        title="Bạn có chắc chắn muốn hủy hồ sơ/dịch vụ này?"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={cancelLoading}
        okText="Hủy hồ sơ"
        okType="danger"                    // Nút OK màu đỏ để cảnh báo
        cancelText="Không"
      >
        <div>Bệnh nhân: {selectedTreatment?.customerName}</div>
        <Input.TextArea
          rows={3}
          placeholder="Nhập lý do huỷ"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          style={{ marginTop: 16 }}
        />
      </Modal>

      {/* ===== MODAL XEM LAB TESTS ===== */}
      {/* Modal hiển thị danh sách lab tests của một treatment step */}
      <Modal
        title="Xét nghiệm"
        open={showLabTestModal}
        onCancel={() => {
          setShowLabTestModal(false);
          setLabTestStep(null);
        }}
        footer={null}
        width={700}
        centered
      >
        <div style={{ marginTop: 0, borderTop: "none", paddingTop: 0 }}>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 16 }}>
            Danh sách xét nghiệm:
          </div>
          {loadingLabTests ? (
            // Hiển thị loading spinner khi đang tải lab tests
            <div style={{ textAlign: "center", padding: 20 }}>
              <Spin size="large" />
            </div>
          ) : labTests.length === 0 ? (
            // Hiển thị empty state khi không có lab tests
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
            <>
              {/* ===== DANH SÁCH LAB TESTS - Hiển thị tối đa 3 lab tests đầu tiên ===== */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  justifyContent: "center",
                }}
              >
                {Array.isArray(labTests) &&
                  labTests.slice(0, 3).map((test, index) => (
                    <Card
                      key={test.id}
                      size="small"
                      style={{
                        width: 200,
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
                        position: "relative",
                        marginBottom: 8,
                        background: "#fff",
                        minHeight: 180,
                      }}
                      bodyStyle={{ padding: 16 }}
                    >
                      {/* Icon trạng thái ở góc phải trên */}
                      <div
                        style={{ position: "absolute", top: 10, right: 10 }}
                      >
                        {test.result === "SUCCESS" && (
                          <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        )}
                        {test.result === "FAILURE" && (
                          <CloseOutlined style={{ color: "#ff4d4f" }} />
                        )}
                        {test.result === "UNDETERMINED" && (
                          <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                        )}
                      </div>
                      
                      {/* Thông tin xét nghiệm */}
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Tên xét nghiệm:</Text>
                        <br />
                        <Text>{test.testName}</Text>
                      </div>
                      
                      {/* Ghi chú với ellipsis overflow */}
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
                          title={test.notes} // tooltip đầy đủ khi hover
                        >
                          {test.notes || "Không có ghi chú"}
                        </Text>
                      </div>
                      
                      {/* Kết quả xét nghiệm */}
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Kết quả:</Text>
                        <br />
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
                        >
                          {test.result === "SUCCESS"
                            ? "Thành công"
                            : test.result === "FAILURE"
                            ? "Thất bại"
                            : test.result === "UNDETERMINED"
                            ? "Đang kiểm tra"
                            : "Chưa có"}
                        </Tag>
                      </div>
                      
                      {/* Action buttons */}
                      <div style={{ marginTop: 12, textAlign: "center" }}>
                        <Space size="small">
                          <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            style={{
                              background: "#1890ff",
                              borderColor: "#1890ff",
                              color: "#fff",
                              borderRadius: 6,
                              fontSize: 11,
                              height: 24,
                            }}
                            onClick={() => {
                              setShowLabTestModal(false);
                              handleShowAddLabTestModal(test);
                            }}
                          >
                            Sửa
                          </Button>
                          <Popconfirm
                            title="Xóa xét nghiệm"
                            description="Bạn có chắc chắn muốn xóa xét nghiệm này?"
                            onConfirm={() => handleDeleteLabTest(test.id, labTestStep)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okType="danger"
                          >
                            <Button
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              style={{
                                borderRadius: 6,
                                fontSize: 11,
                                height: 24,
                              }}
                            >
                              Xóa
                            </Button>
                          </Popconfirm>
                        </Space>
                      </div>
                    </Card>
                  ))}
              </div>

              {/* ===== HIỂN THỊ THÊM CÁC XÉT NGHIỆM CÒN LẠI ===== */}
              {Array.isArray(labTests) &&
                labTests.some((test) => test.showAll) && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 16,
                      justifyContent: "center",
                      marginTop: 16,
                    }}
                  >
                    {labTests.slice(3).map((test, index) => {
                      return (
                        <Card
                          key={test.id}
                          size="small"
                          style={{
                            width: 200,
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
                            {test.result === "SUCCESS" && (
                              <CheckCircleOutlined style={{ color: "#52c41a" }} />
                            )}
                            {test.result === "FAILURE" && (
                              <CloseOutlined style={{ color: "#ff4d4f" }} />
                            )}
                            {test.result === "UNDETERMINED" && (
                              <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                            )}
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <Text strong>Tên xét nghiệm:</Text>
                            <br />
                            <Text>{test.testName}</Text>
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
                              title={test.notes} // tooltip đầy đủ khi hover
                            >
                              {test.notes || "Không có ghi chú"}
                            </Text>
                          </div>
                          {/* Nút cập nhật trạng thái cho lab tests từ thứ 4 trở đi */}
                          <div style={{ marginTop: 12, textAlign: "center" }}>
                            <Button
                              type="primary"
                              size="small"
                              style={{
                                background: "#fa8c16",
                                borderColor: "#fa8c16",
                                color: "#fff",
                                borderRadius: 6,
                                fontSize: 12,
                                height: 28,
                              }}
                              onClick={() =>
                                setLabTests((prev) =>
                                  Array.isArray(prev)
                                    ? prev.map((t, i) =>
                                        i === index + 3
                                          ? { ...t, showAll: !t.showAll }
                                          : t
                                      )
                                    : []
                                )
                              }
                            >
                              {test.showAll ? "Ẩn bớt" : "Xem thêm"}
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}

              {/* ===== NÚT "XEM THÊM" HOẶC "ẨN BỚT" ===== */}
              {labTests.length > 3 && (
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  {labTests.some((test) => test.showAll) ? (
                    // Nút "Ẩn bớt" - chỉ hiển thị 3 lab tests đầu
                    <Button
                      type="default"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        // Ẩn bớt - chỉ hiển thị 3 xét nghiệm đầu
                        setLabTests((prev) => {
                          if (Array.isArray(prev)) {
                            return prev.map((test) => ({
                              ...test,
                              showAll: false,
                            }));
                          }
                          return prev;
                        });
                      }}
                      style={{ borderRadius: 8, minWidth: 140 }}
                    >
                      Ẩn bớt
                    </Button>
                  ) : (
                    // Nút "Xem thêm" - hiển thị tất cả lab tests
                    <Button
                      type="default"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        // Hiển thị tất cả xét nghiệm
                        setLabTests((prev) => {
                          if (Array.isArray(prev)) {
                            return prev.map((test) => ({
                              ...test,
                              showAll: true,
                            }));
                          }
                          return prev;
                        });
                      }}
                      style={{ borderRadius: 8, minWidth: 140 }}
                    >
                      Xem thêm ({labTests.length - 3})
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
          
          {/* Nút tạo xét nghiệm mới ở cuối modal */}
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setShowLabTestModal(false);
                setLabTestStep(labTestStep);
                handleShowAddLabTestModal();
              }}
              size="large"
              style={{ borderRadius: 8, minWidth: 140 }}
            >
              Tạo xét nghiệm mới
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===== MODAL THÊM/SỬA LAB TEST ===== */}
      {/* Modal thêm/sửa lab test cho một treatment step */}
      <Modal
        title={editingLabTest ? "Sửa xét nghiệm" : "Tạo xét nghiệm mới"}
        open={showAddLabTestModal}
        onCancel={() => {
          setShowAddLabTestModal(false);
          setEditingLabTest(null);
        }}
        footer={null}
        width={400}
        centered
      >
        <Form
          form={labTestForm}
          layout="vertical"
          onFinish={(values) => handleLabTestSubmit(values, editingLabTest, labTestStep)}
          initialValues={{
            testName: editingLabTest?.testName,
            notes: editingLabTest?.notes,
            ...(editingLabTest && { result: editingLabTest?.result }),
          }}
        >
          <Form.Item
            name="testName"
            label="Tên xét nghiệm"
            rules={[{ required: true, message: "Nhập tên xét nghiệm" }]}
          >
            <AutoComplete
              placeholder="Chọn hoặc nhập tên xét nghiệm"
              options={labTestTypes.map(type => ({ value: type, label: type }))}
              style={{ width: "100%" }}
              allowClear
              showSearch
              filterOption={(inputValue, option) =>
                option.value.toLowerCase().includes(inputValue.toLowerCase())
              }
              notFoundContent={loadingLabTestTypes ? <Spin size="small" /> : "Không tìm thấy"}
            />
          </Form.Item>
          
          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={2} placeholder="Ghi chú (nếu có)" />
          </Form.Item>
          
          {/* Hiển thị trường kết quả chỉ khi đang sửa lab test */}
          {editingLabTest && (
            <Form.Item name="result" label="Kết quả">
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn kết quả"
                defaultValue={editingLabTest?.result}
              >
                <Select.Option value="SUCCESS">Thành công</Select.Option>
                <Select.Option value="FAILURE">Thất bại</Select.Option>
                <Select.Option value="UNDETERMINED">Đang kiểm tra</Select.Option>
              </Select>
            </Form.Item>
          )}
          
          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  background: editingLabTest ? "#fa8c16" : "#1890ff",
                  borderColor: editingLabTest ? "#fa8c16" : "#1890ff",
                  color: "#fff",
                }}
              >
                {editingLabTest ? "Cập nhật" : "Thêm"}
              </Button>
              <Button
                onClick={() => {
                  setShowAddLabTestModal(false);
                  setEditingLabTest(null);
                }}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
// Export component TreatmentStageDetails để sử dụng trong routing system
export default TreatmentStageDetails;
