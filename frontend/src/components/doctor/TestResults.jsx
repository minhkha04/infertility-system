import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Input,
  Typography,
  notification,
} from "antd";
import {
  UserOutlined,
  EyeOutlined,
  DownOutlined,
  UpOutlined,
  FileTextOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { treatmentService } from "../../service/treatment.service";
import { authService } from "../../service/auth.service";
import { useNavigate } from "react-router-dom";
import TreatmentDetailRow from "./TreatmentDetailRow";
import { NotificationContext } from "../../App";

const { Text } = Typography;

const TestResults = () => {
  // ===== STATE MANAGEMENT =====
  // State quản lý filter và search
  const [searchText, setSearchText] = useState("");                        // Text tìm kiếm
  const [statusFilter, setStatusFilter] = useState("all");                 // Filter theo trạng thái
  
  // State quản lý data và UI
  const [records, setRecords] = useState([]);                              // Danh sách treatment records grouped by customer
  const [doctorId, setDoctorId] = useState("");                           // ID của doctor hiện tại
  const [expandedRows, setExpandedRows] = useState([]);                    // Danh sách rows đã expand
  const [cancelLoading, setCancelLoading] = useState(false);               // Loading state cho cancel action
  
  // State quản lý statistics (unused hiện tại)
  const [stats, setStats] = useState({
    totalRecords: 0,            // Tổng số records
    inProgress: 0,              // Số records đang điều trị
    completed: 0,               // Số records hoàn thành
    cancelled: 0,               // Số records đã hủy
  });

  // State quản lý pagination
  const [currentPage, setCurrentPage] = useState(0);                      // Trang hiện tại (0-based)
  const [totalPages, setTotalPages] = useState(1);                        // Tổng số trang
  
  // State quản lý modal cancel
  const [isModalVisible, setIsModalVisible] = useState(false);             // Hiển thị modal cancel
  const [cancelReason, setCancelReason] = useState("");                    // Lý do cancel
  const [selectedTreatment, setSelectedTreatment] = useState(null);        // Treatment được chọn để cancel

  // ===== CONTEXT & NAVIGATION =====
  const { showNotification } = useContext(NotificationContext);            // Context hiển thị thông báo
  const navigate = useNavigate();                                          // Hook điều hướng

  // ===== USEEFFECT: TẢI THÔNG TIN DOCTOR =====
  // useEffect này chạy khi component mount để lấy thông tin doctor hiện tại
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        const res = await authService.getMyInfo();                         // Gọi API lấy thông tin user
        const id = res?.data?.result?.id;
        if (id) {
          setDoctorId(id);                                                 // Set doctor ID
        } else {
          notification.error({
            message: "Lỗi",
            description: "Không thể lấy thông tin bác sĩ",
          });
        }
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể lấy thông tin bác sĩ",
        });
      }
    };
    fetchDoctorInfo();
  }, []);

  // ===== API FUNCTION: TẢI DANH SÁCH TREATMENT RECORDS =====
  // Hàm fetch danh sách treatment records với pagination
  const fetchDashboardStats = async (page = 0) => {
    try {
      // Gọi API lấy treatment records với pagination
      const response = await treatmentService.getTreatmentRecordsPagination({
        doctorId,
        page,
        size: 10,                                                          // 10 records per page
      });

      const data = response?.data?.result?.content || [];

      // Format data thành structure phù hợp cho table (grouped by customer)
      const formatted = data.map((item) => ({
        key: item.customerId,
        customerId: item.customerId,
        customerName: item.customerName,
        totalRecord: item.totalRecord,                                     // Tổng số treatments của customer này
        treatments: [],                                                    // Chi tiết treatments sẽ load khi expand
      }));
      
      setCurrentPage(page);                                                // Update current page
      setTotalPages(response.data.result.totalPages);                      // Update total pages
      setRecords(formatted);                                               // Set formatted records
    } catch (error) {
      console.error("❌ Error loading dashboard stats:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải số liệu tổng quan.",
      });
    }
  };

  // ===== USEEFFECT: TẢI DANH SÁCH KHI CÓ DOCTOR ID =====
  // useEffect này chạy khi có doctorId để load treatment records
  useEffect(() => {
    if (!doctorId) return;  // Cần có doctorId mới fetch data
    fetchDashboardStats();
  }, [doctorId]);

  // ===== UTILITY FUNCTION: STATUS TAG =====
  // Hàm tạo Tag component với màu sắc cho các trạng thái treatment
  const getStatusTag = (status) => {
    const statusMap = {
      PENDING: { color: "orange", text: "Đang chờ xử lý" },
      INPROGRESS: { color: "blue", text: "Đang điều trị" },
      CANCELLED: { color: "red", text: "Đã hủy" },
      COMPLETED: { color: "green", text: "Hoàn thành" },
      CONFIRMED: { color: "blue", text: "Đã xác nhận" },
    };
    return (
      <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
    );
  };

  // ===== HANDLER: XEM CHI TIẾT TREATMENT =====
  // Hàm xử lý khi click xem chi tiết treatment
  const viewRecord = (record) => {
    navigate("/doctor-dashboard/treatment-stages", {
      state: {
        patientInfo: {                                                     // Thông tin patient
          customerId: record.customerId,
          customerName: record.customerName,
        },
        treatmentData: record,                                             // Dữ liệu treatment
        sourcePage: "test-results",                                        // Source page để biết đến từ đâu
      },
    });
  };

  // ===== HANDLER: APPROVE TREATMENT =====
  // Hàm xử lý khi approve treatment (chuyển status từ PENDING -> INPROGRESS)
  const handleApprove = async (treatment) => {
    try {
      // Gọi API cập nhật status treatment thành INPROGRESS
      const response = await treatmentService.updateTreatmentRecordStatus(
        treatment.id,
        "INPROGRESS"
      );
      
      if (response?.data?.code === 1000) {
        notification.success({
          message: "Duyệt hồ sơ thành công!",
          description: `Hồ sơ của bệnh nhân ${treatment.customerName} đã chuyển sang trạng thái 'Đang điều trị'.`,
        });
        
        // Refresh the list using new API để cập nhật UI
        const updatedRecords =
          await treatmentService.getTreatmentRecordsPagination({
            doctorId: doctorId,
            page: 0,
            size: 100,
          });

        if (updatedRecords?.data?.result?.content) {
          const treatmentRecords = updatedRecords.data.result.content;

          // Group treatments by customer name để format lại data
          const groupedByCustomer = treatmentRecords.reduce((acc, record) => {
            const customerName = record.customerName;
            if (!acc[customerName]) {
              acc[customerName] = [];
            }
            acc[customerName].push(record);
            return acc;
          }, {});

          // Format thành structure cho table
          const formattedRecords = Object.entries(groupedByCustomer).map(
            ([customerName, treatments]) => {
              const sortedTreatments = treatments.sort(                    // Sort by date desc
                (a, b) => new Date(b.startDate) - new Date(a.startDate)
              );

              return {
                key: customerName,
                customerId: sortedTreatments[0].customerId,
                customerName: customerName,
                treatments: sortedTreatments.map((treatment) => ({
                  ...treatment,
                  key: treatment.id,
                })),
              };
            }
          );

          setRecords(formattedRecords);                                    // Update records state
        }
      } else {
        notification.error({
          message: "Duyệt hồ sơ thất bại!",
          description:
            response?.data?.message ||
            "Không thể duyệt hồ sơ, vui lòng thử lại.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi khi duyệt hồ sơ!",
        description: error.message || "Đã xảy ra lỗi, vui lòng thử lại.",
      });
    }
  };

  // ===== HANDLER: CANCEL TREATMENT PREPARATION =====
  // Hàm xử lý khi click cancel treatment (mở modal)
  const handleCancelService = (treatment) => {
    setSelectedTreatment(treatment);                                       // Set treatment được chọn
    setIsModalVisible(true);                                               // Mở modal
  };

  // ===== HANDLER: CONFIRM CANCEL TREATMENT =====
  // Hàm xử lý khi confirm cancel trong modal
  const handleOk = async () => {
    if (!cancelReason.trim()) {                                            // Validate lý do cancel
      showNotification("Vui lòng nhập lý do huỷ!", "warning");
      return;
    }
    
    setCancelLoading(true);
    try {
      // Gọi API cancel treatment với lý do
      await treatmentService.cancelTreatmentRecord(
        selectedTreatment.id,
        cancelReason
      );
      showNotification("Hủy hồ sơ thành công!", "success");
      setIsModalVisible(false);                                            // Đóng modal
      setCancelReason("");                                                 // Reset lý do
      setTimeout(() => window.location.reload(), 800);                    // Reload page sau 800ms
    } catch (err) {
      showNotification(err.response?.data?.message, "error");
    } finally {
      setCancelLoading(false);
    }
  };

  // ===== HANDLER: CANCEL MODAL =====
  // Hàm xử lý khi cancel modal
  const handleCancel = () => {
    setIsModalVisible(false);                                              // Đóng modal
    setCancelReason("");                                                   // Reset lý do
  };

  // ===== EXPANDABLE ROW RENDER FUNCTION =====
  // Hàm render nội dung khi expand row (hiển thị TreatmentDetailRow component)
  const expandedRowRender = (record) => {
    return (
      <TreatmentDetailRow
        customerId={record.customerId}                                     // Pass customer ID
        doctorId={doctorId}                                                // Pass doctor ID
        viewRecord={viewRecord}                                            // Pass callback xem chi tiết
        handleApprove={handleApprove}                                      // Pass callback approve
        handleCancelService={handleCancelService}                         // Pass callback cancel
      />
    );
  };

  // ===== MAIN TABLE COLUMNS CONFIGURATION =====
  // Cấu hình các columns cho bảng chính (customer records)
  const columns = [
    {
      title: "Bệnh nhân",
      dataIndex: "customerName",
      key: "customerName",
      render: (name) => (
        <Space>
          <UserOutlined style={{ color: "#1890ff" }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Số dịch vụ",
      key: "treatmentCount",
      // Hiển thị số lượng treatments của customer
      render: (_, record) => (
        <Tag color="blue">{record.totalRecord} dịch vụ</Tag>
      ),
    },
    {
      title: "Chi tiết",
      key: "expand",
      render: (_, record) => {
        const isExpanded = expandedRows.includes(record.key);
        return (
          <Button
            type="text"
            icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
            onClick={() => {
              // Cập nhật state expanded rows
              const newExpanded = isExpanded
                ? expandedRows.filter((key) => key !== record.key)         // Remove from expanded
                : [...expandedRows, record.key];                          // Add to expanded
              setExpandedRows(newExpanded);
            }}
          >
            {isExpanded ? "Thu gọn" : "Xem thêm"}
          </Button>
        );
      },
    },
  ];

  // ===== TREATMENT DETAIL COLUMNS CONFIGURATION (UNUSED) =====
  // Cấu hình columns cho bảng chi tiết treatments (hiện tại không dùng, được thay bằng TreatmentDetailRow)
  const columnsChiTiet = [
    {
      title: "Dịch vụ",
      dataIndex: "serviceName",
      key: "serviceName",
      render: (text, record) => (
        <Space>
          <FileTextOutlined style={{ color: "#722ed1" }} />
          <Text strong>{text || "Chưa có thông tin"}</Text>
        </Space>
      ),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) =>
        date ? (
          <Text>{dayjs(date).format("DD/MM/YYYY")}</Text>                  // Format date
        ) : (
          <Text type="secondary">Không có</Text>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),                           // Sử dụng utility function
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, treatment) => (
        <Space direction="vertical">
          {/* Button xem chi tiết */}
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => viewRecord(treatment)}
          >
            Xem chi tiết
          </Button>
          
          {/* Button approve - chỉ hiển thị cho status PENDING */}
          {treatment.status === "PENDING" && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(treatment)}
              style={{ background: "#52c41a", borderColor: "#52c41a" }}
            >
              Duyệt
            </Button>
          )}
          
          {/* Button cancel - không hiển thị cho CANCELLED và COMPLETED */}
          {treatment.status !== "CANCELLED" &&
            treatment.status !== "COMPLETED" && (
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleCancelService(treatment)}
              >
                Hủy hồ sơ
              </Button>
            )}
        </Space>
      ),
    },
  ];

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div>
      {/* ===== MAIN TABLE SECTION ===== */}
      {/* Bảng chính hiển thị danh sách customers với expandable rows */}
      <Card>
        <Table
          dataSource={records.filter((record) => {
            // Filter logic theo search text và status
            const matchesSearch = record.customerName
              .toLowerCase()
              .includes(searchText.toLowerCase());                         // Tìm theo tên customer
            const matchesStatus =
              statusFilter === "all" ||
              record.treatments.some((t) => t.status === statusFilter);    // Filter theo status treatments
            return matchesSearch && matchesStatus;
          })}
          columns={columns}                                                // Columns configuration
          expandable={{
            expandedRowRender,                                             // Function render expanded content
            expandedRowKeys: expandedRows,                                 // Danh sách rows đã expand
            onExpand: async (expanded, record) => {
              // Handler khi expand/collapse row
              const customerId = record.customerId;

              const newExpandedRows = expanded
                ? [...expandedRows, record.key]                           // Add to expanded
                : expandedRows.filter((key) => key !== record.key);       // Remove from expanded
              setExpandedRows(newExpandedRows);
            },
            expandIcon: () => {                                            // Hide default expand icon
              null;
            },
          }}
          pagination={false}                                               // Disable built-in pagination
        />
        
        {/* ===== CUSTOM PAGINATION ===== */}
        {/* Custom pagination controls */}
        <div className="flex justify-end mt-4">
          <Button
            disabled={currentPage === 0}                                  // Disable nếu ở trang đầu
            onClick={() => fetchDashboardStats(currentPage - 1)}
            className="mr-2"
          >
            Trang trước
          </Button>
          <span className="px-4 py-1 bg-gray-100 rounded text-sm">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <Button
            disabled={currentPage + 1 >= totalPages}                     // Disable nếu ở trang cuối
            onClick={() => fetchDashboardStats(currentPage + 1)}
            className="ml-2"
          >
            Trang tiếp
          </Button>
        </div>
      </Card>

      {/* ===== CANCEL TREATMENT MODAL ===== */}
      {/* Modal confirm để cancel treatment với lý do */}
      <Modal
        title="Bạn có chắc chắn muốn hủy hồ sơ/dịch vụ này?"
        open={isModalVisible}
        onOk={handleOk}                                                    // Handler confirm cancel
        onCancel={handleCancel}                                            // Handler close modal
        confirmLoading={cancelLoading}                                     // Loading state
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
export default TestResults;
