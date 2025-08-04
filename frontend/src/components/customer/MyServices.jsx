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
  Modal,
  Descriptions,
  Collapse,
  Progress,
  Space,
  Input,
} from "antd";
import {
  ExperimentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { treatmentService } from "../../service/treatment.service";
import { authService } from "../../service/auth.service";
import { useNavigate } from "react-router-dom";
import { path } from "../../common/path";
import { NotificationContext } from "../../App";

const { Title, Text } = Typography;

const MyServices = () => {
  // ===== CONTEXT & NAVIGATION =====
  const { showNotification } = useContext(NotificationContext);            // Context hiển thị thông báo
  const navigate = useNavigate();                                          // Hook điều hướng
  
  // ===== STATE MANAGEMENT =====
  // State quản lý loading và data
  const [loading, setLoading] = useState(true);                           // Loading state chính
  const [treatmentRecords, setTreatmentRecords] = useState([]);           // Danh sách treatment records
  const [userId, setUserId] = useState(null);                             // ID của customer hiện tại
  
  // State quản lý statistics
  const [statistics, setStatistics] = useState({
    totalServices: 0,           // Tổng số dịch vụ
    cancelledServices: 0,       // Số dịch vụ đã hủy
    inProgressServices: 0,      // Số dịch vụ đang thực hiện
  });
  
  // State quản lý cancel actions
  const [cancelLoading, setCancelLoading] = useState({});                 // Loading state cho từng record
  const [isModalVisible, setIsModalVisible] = useState(false);            // Hiển thị modal cancel
  const [cancelReason, setCancelReason] = useState("");                   // Lý do cancel
  const [selectedTreatment, setSelectedTreatment] = useState(null);       // Treatment được chọn để cancel
  const [cancelLoadingRecord, setCancelLoadingRecord] = useState(false);  // Loading state cancel action
  
  // State quản lý detail modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);    // Hiển thị modal chi tiết
  const [selectedTreatmentDetail, setSelectedTreatmentDetail] = useState(null); // Treatment detail được chọn
  const [detailLoading, setDetailLoading] = useState(false);              // Loading state detail modal
  
  // State quản lý pagination
  const [currentPage, setCurrentPage] = useState(0);                      // Trang hiện tại (0-based)
  const [totalPages, setTotalPages] = useState(1);                        // Tổng số trang

  // ===== USEEFFECT: INITIAL DATA LOAD =====
  // useEffect này chạy khi component mount để load data
  useEffect(() => {
    fetchTreatmentRecords();                                               // Load treatment records
    
    // Fetch user info async
    const fetchUser = async () => {
      try {
        const res = await authService.getMyInfo();                        // Gọi API lấy thông tin user
        setUserId(res?.data?.result?.id);                                 // Set user ID
      } catch {}
    };
    fetchUser();
  }, []);

  // ===== API FUNCTION: FETCH TREATMENT RECORDS =====
  // Hàm lấy danh sách treatment records với pagination
  const fetchTreatmentRecords = async (page = 0) => {
    try {
      setLoading(true);
      const userResponse = await authService.getMyInfo();                 // Lấy thông tin user

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

      // Gọi API lấy treatment records với pagination
      const response = await treatmentService.getTreatmentRecords({
        customerId: customerId,
        page,
        size: 10,
      });

      if (response?.data?.result?.content) {
        const records = response.data.result.content;
        console.log(records);

        // Chỉ cho nhấn feedback khi đã hoàn thành hồ sơ điều trị
        const enrichedRecords = records.map((record) => ({
          ...record,
          canFeedback: record.status === "COMPLETED",                     // Flag để enable feedback button
        }));
        
        setTreatmentRecords(enrichedRecords);                             // Set records data
        setCurrentPage(page);                                             // Update current page
        setTotalPages(response.data.result.totalPages);                   // Update total pages
        
        // Calculate statistics
        const stats = {
          totalServices: records.length,
          cancelledServices: records.filter((r) => r.status === "CANCELLED").length,
          inProgressServices: records.filter((r) => r.status === "INPROGRESS").length,
        };
        setStatistics(stats);                                             // Set statistics
      }
    } catch (error) {
      console.error("Error fetching treatment records:", error);
      showNotification("Có lỗi xảy ra khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  // ===== UTILITY FUNCTIONS: STATUS MAPPING =====
  
  // Hàm lấy status tag với màu sắc cho treatment records
  const getStatusTag = (status) => {
    switch (status) {
      case "COMPLETED":
        return <Tag color="success">Hoàn thành</Tag>;
      case "INPROGRESS":
        return <Tag color="processing">Đang điều trị</Tag>;
      case "PENDING":
        return <Tag color="warning">Đang chờ điều trị</Tag>;
      case "CANCELLED":
        return <Tag color="error">Đã hủy</Tag>;
      case "PLANED":
        return <Tag color="warning">Đã lên lịch</Tag>;
      case "CONFIRMED":
        return <Tag color="processing">Đã xác nhận</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // Hàm lấy status tag cho treatment steps
  const getStepStatusTag = (status) => {
    switch ((status || "").toUpperCase()) {
      case "COMPLETED":
        return <Tag color="success">Hoàn thành</Tag>;
      case "INPROGRESS":
        return <Tag color="processing">Đang thực hiện</Tag>;
      case "CONFIRMED":
        return <Tag color="processing">Đã xác nhận</Tag>;
      case "PENDING":
      case "PLANED":
        return <Tag color="warning">Đang chờ điều trị</Tag>;
      case "CANCELLED":
        return <Tag color="error">Đã hủy</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // Hàm chuyển đổi result sang tiếng Việt
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

  // ===== HANDLERS =====
  
  // Hàm xử lý cancel treatment (mở modal)
  const handleCancelTreatment = (treatment) => {
    setSelectedTreatment(treatment);                                      // Set treatment được chọn
    setIsModalVisible(true);                                              // Mở modal
  };

  // Hàm xử lý confirm cancel trong modal
  const handleOk = async () => {
    if (!cancelReason.trim()) {                                           // Validate lý do cancel
      showNotification("Vui lòng nhập lý do huỷ!", "warning");
      return;
    }
    
    setCancelLoadingRecord(true);
    try {
      // Gọi API cancel treatment record
      await treatmentService.cancelTreatmentRecord(
        selectedTreatment.id,
        cancelReason
      );
      
      showNotification("Hủy hồ sơ thành công!", "success");
      setIsModalVisible(false);                                           // Đóng modal
      setCancelReason("");                                                // Reset lý do
    } catch (err) {
      showNotification(err.response?.data?.message, "error");
    } finally {
      setCancelLoadingRecord(false);
    }
  };

  // Hàm xử lý cancel modal
  const handleCancel = () => {
    setIsModalVisible(false);                                             // Đóng modal
    setCancelReason("");                                                  // Reset lý do
  };

  // Hàm mở feedback form
  const handleOpenFeedbackForm = (record) => {
    if (!record.canFeedback) return;                                      // Chỉ cho feedback khi completed
    
    navigate(path.customerFeedback, {
      state: {
        recordId: record.id,                                              // Pass record ID để tạo feedback
      },
    });
  };

  // Hàm xem chi tiết treatment
  const handleViewTreatmentDetail = async (record) => {
    setDetailLoading(true);
    setDetailModalVisible(true);                                          // Mở modal
    
    try {
      // Gọi API lấy chi tiết treatment record
      const res = await treatmentService.getTreatmentRecordById(record.id);
      setSelectedTreatmentDetail(res?.data?.result || record);           // Set detail data
    } catch (err) {
      setSelectedTreatmentDetail(record);                                 // Fallback với record gốc
    } finally {
      setDetailLoading(false);
    }
  };

  // ===== TABLE COLUMNS CONFIGURATION =====
  // Cấu hình các columns cho bảng treatment records
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
            handleViewTreatmentDetail(record);                            // Xem chi tiết
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
            handleCancelTreatment(record);                                // Cancel treatment
          }}
          disabled={!userId || record.status === "CANCELLED"}           // Disable nếu đã cancel
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
            handleOpenFeedbackForm(record);                             // Mở feedback form
            console.log(record.id);
          }}
          disabled={!record.canFeedback}                                 // Chỉ enable khi completed
        >
          Feedback
        </Button>
      ),
    },
  ];

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div>
      {/* ===== MAIN TABLE SECTION ===== */}
      {/* Card chính chứa bảng treatment records */}
      <Card
        variant="outlined"
        style={{
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(24,144,255,0.06)",
          background: "#fff",
        }}
      >
        <Table
          columns={columns}                                               // Columns configuration
          dataSource={treatmentRecords}                                  // Treatment records data
          rowKey="id"                                                     // Unique key cho mỗi row
          pagination={false}                                              // Disable built-in pagination
          bordered
          style={{ borderRadius: 12, overflow: "hidden" }}
        />
        
        {/* Custom pagination controls */}
        <div className="flex justify-end mt-4">
          <Button
            disabled={currentPage === 0}                                 // Disable nếu ở trang đầu
            onClick={() => fetchTreatmentRecords(currentPage - 1)}
            className="mr-2"
          >
            Trang trước
          </Button>
          <span className="px-4 py-1 bg-gray-100 rounded text-sm">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <Button
            disabled={currentPage + 1 >= totalPages}                     // Disable nếu ở trang cuối
            onClick={() => fetchTreatmentRecords(currentPage + 1)}
            className="ml-2"
          >
            Trang tiếp
          </Button>
        </div>
      </Card>
      
      {/* ===== TREATMENT DETAIL MODAL ===== */}
      {/* Modal hiển thị chi tiết treatment record */}
      <Modal
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}                                                     // Custom footer
        title="Chi tiết quá trình điều trị"
        width={900}
      >
        {detailLoading ? (
          <Spin />
        ) : selectedTreatmentDetail ? (
          <div>
            {/* ===== TREATMENT BASIC INFO ===== */}
            {/* Thông tin cơ bản của treatment */}
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Gói điều trị">
                {selectedTreatmentDetail.treatmentServiceName ||
                  selectedTreatmentDetail.serviceName}
              </Descriptions.Item>
              <Descriptions.Item label="Bác sĩ">
                {selectedTreatmentDetail.doctorName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu">
                {selectedTreatmentDetail.startDate
                  ? dayjs(selectedTreatmentDetail.startDate).format("DD/MM/YYYY")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(selectedTreatmentDetail.status)}
              </Descriptions.Item>
              
              {/* Kết quả điều trị */}
              <Descriptions.Item label="Kết quả">
                <Tag
                  color={
                    selectedTreatmentDetail.result === "SUCCESS"
                      ? "green"
                      : selectedTreatmentDetail.result === "FAILURE"
                      ? "red"
                      : selectedTreatmentDetail.result === "UNDETERMINED"
                      ? "orange"
                      : "default"
                  }
                >
                  {(() => {
                    switch ((selectedTreatmentDetail.result || "").toUpperCase()) {
                      case "SUCCESS":
                        return "Thành công";
                      case "FAILURE":
                        return "Thất bại";
                      case "UNDETERMINED":
                        return "Chưa xác định";
                      default:
                        return "Chưa có";
                    }
                  })()}
                </Tag>
              </Descriptions.Item>
              
              {/* Ghi chú */}
              <Descriptions.Item label="Ghi chú">
                {selectedTreatmentDetail.notes || "Không có ghi chú"}
              </Descriptions.Item>
            </Descriptions>

            {/* ===== TREATMENT STEPS COLLAPSE ===== */}
            {/* Collapse hiển thị các bước điều trị */}
            <Collapse
              items={(selectedTreatmentDetail.treatmentSteps || []).map(
                (step, idx) => ({
                  key: step.id || idx,
                  label: (
                    <Space>
                      <b>{step.name}</b> {getStepStatusTag(step.status)}
                    </Space>
                  ),
                  children: (
                    <div>
                      <Descriptions size="small" column={1} bordered>
                        <Descriptions.Item label="Ngày bắt đầu">
                          {step.startDate
                            ? dayjs(step.startDate).format("DD/MM/YYYY")
                            : "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày hoàn thành">
                          {step.endDate
                            ? dayjs(step.endDate).format("DD/MM/YYYY")
                            : "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú">
                          {step.notes || "-"}
                        </Descriptions.Item>
                      </Descriptions>
                    </div>
                  ),
                })
              )}
            />
          </div>
        ) : (
          <Text type="secondary">Không có dữ liệu chi tiết</Text>
        )}
      </Modal>
      
      {/* ===== CANCEL MODAL ===== */}
      {/* Modal confirm cancel treatment */}
      <Modal
        title="Bạn có chắc chắn muốn hủy hồ sơ/dịch vụ này?"
        open={isModalVisible}
        onOk={handleOk}                                                   // Handler confirm cancel
        onCancel={handleCancel}                                           // Handler close modal
        confirmLoading={cancelLoadingRecord}                              // Loading state
        okText="Hủy hồ sơ"
        okType="danger"
        cancelText="Không"
      >
        <div>Bệnh nhân: {selectedTreatment?.customerName}</div>
        
        {/* Textarea nhập lý do cancel */}
        <Input.TextArea
          rows={3}
          placeholder="Nhập lý do huỷ"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          style={{ marginTop: 16 }}
        />
      </Modal>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default MyServices;
