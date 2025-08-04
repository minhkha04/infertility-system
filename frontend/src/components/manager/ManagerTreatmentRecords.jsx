import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Input,
  Select,
  notification,
  Spin,
  Typography,
  Statistic,
} from "antd";
import {
  UserOutlined,
  EyeOutlined,
  DownOutlined,
  UpOutlined,
  FileTextOutlined,
  CheckOutlined,
  CloseOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { treatmentService } from "../../service/treatment.service";
import { useNavigate } from "react-router-dom";
import ManagerTreatmentDetailRow from "./ManagerTreatmentDetailRow";

const { Search } = Input;
const { Text } = Typography;

const ManagerTreatmentRecords = () => {
  // ===== NAVIGATION =====
  const navigate = useNavigate();                                            // Hook điều hướng

  // ===== STATE MANAGEMENT =====
  // State quản lý search và filter
  const [searchText, setSearchText] = useState("");                          // Text tìm kiếm
  const [statusFilter, setStatusFilter] = useState("all");                   // Filter theo status

  // State quản lý data
  const [records, setRecords] = useState([]);                                // Danh sách treatment records
  const [loading, setLoading] = useState(true);                              // Loading state chính
  const [totalItems, setTotalItems] = useState(0);                           // Tổng số items
  
  // State quản lý expanded rows
  const [expandedRows, setExpandedRows] = useState([]);                      // Danh sách rows đã expand
  const [treatmentDetails, setTreatmentDetails] = useState({});              // Chi tiết treatments khi expand
  const [loadingRows, setLoadingRows] = useState([]);                        // Loading state cho từng row

  // State quản lý statistics
  const [stats, setStats] = useState({
    totalRecords: 0,          // Tổng số records
    pendingRecords: 0,        // Số records chờ duyệt
    inProgressRecords: 0,     // Số records đang điều trị
    completedRecords: 0,      // Số records hoàn thành
  });

  // State quản lý pagination
  const [currentPage, setCurrentPage] = useState(1);                         // Trang hiện tại (1-based)
  const [totalPages, setTotalPages] = useState(1);                           // Tổng số trang
  const [currentPageExpand, setCurrentPageExpand] = useState(0);             // Trang expand hiện tại (0-based)
  const [totalPagesExpand, setTotalPagesExpand] = useState(1);               // Tổng số trang expand

  // ===== USEEFFECT: INITIAL DATA LOAD =====
  // useEffect này chạy khi component mount để load treatment records
  useEffect(() => {
    fetchRecords();                                                          // Load records khi component mount
  }, []);

  // ===== API FUNCTION: FETCH TREATMENT RECORDS =====
  // Hàm lấy danh sách treatment records với pagination
  const fetchRecords = async (page = 0) => {
    try {
      setLoading(true);
      const response = await treatmentService.getTreatmentRecordsPagination({
        page,                                                                // Page từ 0-based
        size: 8,                                                             // Size mỗi page
      });

      const data = response?.data?.result;
      const content = data?.content || [];

      // Format records để phù hợp với Table component
      const formattedRecords = content.map((item) => ({
        key: item.customerId,
        customerId: item.customerId,
        customerName: item.customerName,
        treatments: [
          {
            id: item.customerId + "-summary",
            customerName: item.customerName,
            totalRecord: item.totalRecord,                                   // Tổng số dịch vụ của customer
          },
        ],
      }));
      
      setCurrentPage(page);                                                  // Update current page
      setTotalPages(response.data.result.totalPages);                        // Update total pages
      setRecords(formattedRecords);                                          // Set formatted records
      setTotalItems(data?.totalElements || content.length);                 // Set total items
    } catch (error) {
      console.error("❌ Error fetching records:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể lấy danh sách hồ sơ điều trị.",
      });
      setRecords([]);                                                        // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // ===== UTILITY FUNCTION: STATUS TAG MAPPING =====
  // Hàm tạo status tag với màu sắc tương ứng
  const getStatusTag = (status) => {
    const statusMap = {
      PENDING: { color: "orange", text: "Đang chờ xử lý" },
      CONFIRMED: { color: "blue", text: "Đã xác nhận" },
      INPROGRESS: { color: "blue", text: "Đang điều trị" },
      CANCELLED: { color: "red", text: "Đã hủy" },
      COMPLETED: { color: "green", text: "Hoàn thành" },
    };
    return (
      <Tag color={statusMap[status]?.color}>
        {statusMap[status]?.text || status}
      </Tag>
    );
  };

  // ===== HANDLER: VIEW TREATMENT RECORD =====
  // Hàm xử lý xem chi tiết treatment record (navigate to treatment stages)
  const viewRecord = (record) => {
    console.log("🔍 Navigating to treatment-stages-view with record:", record);
    navigate("/manager/treatment-stages-view", {
      state: {
        patientInfo: {
          customerId: record.customerId,
          customerName: record.customerName,
        },
        treatmentData: record,
        sourcePage: "manager-treatment-records",                            // Tracking source page
      },
    });
  };

  // ===== HANDLER: APPROVE TREATMENT =====
  // Hàm xử lý duyệt treatment record
  const handleApprove = async (treatment) => {
    try {
      const response = await treatmentService.updateTreatmentStatus(
        treatment.id,
        "INPROGRESS"                                                         // Change status to INPROGRESS
      );
      if (response?.data?.code === 1000) {
        notification.success({
          message: "Duyệt hồ sơ thành công!",
          description: `Hồ sơ của bệnh nhân ${treatment.customerName} đã chuyển sang trạng thái 'Đang điều trị'.`,
        });
        fetchRecords();                                                      // Refresh the list
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

  // ===== HANDLER: CANCEL TREATMENT =====
  // Hàm xử lý hủy treatment record
  const handleCancel = async (treatment) => {
    try {
      const response = await treatmentService.updateTreatmentStatus(
        treatment.id,
        "CANCELLED"                                                          // Change status to CANCELLED
      );
      if (response?.data?.code === 1000) {
        notification.success({
          message: "Hủy hồ sơ thành công!",
          description: `Hồ sơ của bệnh nhân ${treatment.customerName} đã được hủy.`,
        });
        fetchRecords();                                                      // Refresh the list
      } else {
        notification.error({
          message: "Hủy hồ sơ thất bại!",
          description:
            response?.data?.message || "Không thể hủy hồ sơ, vui lòng thử lại.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi khi hủy hồ sơ!",
        description: error.message || "Đã xảy ra lỗi, vui lòng thử lại.",
      });
    }
  };

  // ===== HANDLER: EXPAND CHANGE =====
  // Hàm xử lý khi expand/collapse rows (hiện không sử dụng)
  const handleExpandChange = async (expanded, record, page = 0) => {
    const customerId = record.customerId;

    if (expanded) {
      setLoadingRows((prev) => [...prev, customerId]);                      // Add loading state

      try {
        console.log("➡️ Gọi API khi mở rộng với:", customerId);

        const res = await treatmentService.getTreatmentRecordsExpand({
          customerId,
          page,
          size: 5,
        });

        const data = res?.data?.result?.content || [];
        const treatmentsWithKey = data.map((item) => ({
          ...item,
          key: item.id,
        }));

        setCurrentPageExpand(page);                                          // Update expand page
        setTotalPagesExpand(res.data.result.totalPages);                     // Update expand total pages

        setTreatmentDetails((prev) => ({
          ...prev,
          [customerId]: treatmentsWithKey,                                   // Set treatments for this customer
        }));
      } catch (error) {
        notification.error({
          message: "Lỗi khi tải chi tiết hồ sơ!",
          description: error.message || "Vui lòng thử lại.",
        });
      } finally {
        setLoadingRows((prev) => prev.filter((id) => id !== customerId));   // Remove loading state
      }
    }
  };

  // ===== EXPANDED ROW RENDER FUNCTION =====
  // Hàm render nội dung khi expand row (sử dụng ManagerTreatmentDetailRow component)
  const expandedRowRender = (record) => {
    // ===== COMMENTED OLD IMPLEMENTATION =====
    // Code cũ đã comment để chuyển sang sử dụng ManagerTreatmentDetailRow component
    
    return (
      <ManagerTreatmentDetailRow
        customerId={record.customerId}                                       // Pass customer ID
        viewRecord={viewRecord}                                              // Pass view record handler
        handleApprove={handleApprove}                                        // Pass approve handler
        handleCancel={handleCancel}                                          // Pass cancel handler
      />
    );
  };

  // ===== MAIN TABLE COLUMNS CONFIGURATION =====
  // Cấu hình columns cho bảng chính
  const columns = [
    {
      title: "Bệnh nhân",
      dataIndex: "customerName",
      key: "customerName",
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: "#1890ff" }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Số dịch vụ",
      dataIndex: "treatments",
      key: "totalRecord",
      render: (treatments) => {
        const record = treatments?.[0];
        return <Tag color="blue">{record.totalRecord} dịch vụ</Tag>;         // Hiển thị số dịch vụ
      },
    },

    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={
              expandedRows.includes(record.key) ? (
                <UpOutlined />
              ) : (
                <DownOutlined />
              )
            }
            onClick={() => {
              const isExpanded = expandedRows.includes(record.key);
              const newExpanded = isExpanded
                ? expandedRows.filter((key) => key !== record.key)           // Collapse row
                : [...expandedRows, record.key];                             // Expand row

              setExpandedRows(newExpanded);

              // Trigger expand change handler manually
              handleExpandChange(!isExpanded, record);
            }}
          >
            {expandedRows.includes(record.key) ? "Thu gọn" : "Mở rộng"}
          </Button>
        </Space>
      ),
    },
  ];

  // ===== DETAIL TABLE COLUMNS CONFIGURATION =====
  // Cấu hình columns cho bảng chi tiết khi expand (hiện không sử dụng)
  const columnsChiTiet = [
    {
      title: "Dịch vụ",
      dataIndex: "treatmentServiceName",
      key: "treatmentServiceName",
      render: (text, treatment) => {
        const serviceName =
          treatment.treatmentServiceName ||
          treatment.serviceName ||
          treatment.name ||
          treatment.treatmentService?.name ||
          "Chưa có thông tin";
        return (
          <div>
            <Text strong>{serviceName}</Text>
            {treatment.treatmentServiceDescription && (
              <div>
                <Text type="secondary">
                  {treatment.treatmentServiceDescription}
                </Text>
              </div>
            )}
            {treatment.price && (
              <div>
                <Text style={{ color: "#28a745", fontWeight: "500" }}>
                  {treatment.price.toLocaleString("vi-VN")} VNĐ
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctorName",
      key: "doctorName",
      render: (text, treatment) => (
        <div>
          <Text strong>{text || "Chưa có thông tin"}</Text>
          {treatment.doctorEmail && (
            <div>
              <Text type="secondary">{treatment.doctorEmail}</Text>
            </div>
          )}
          {treatment.doctorPhone && (
            <div>
              <Text type="secondary">{treatment.doctorPhone}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "startDate",
      key: "startDate",
      render: (date, treatment) => (
        <div>
          <Text strong>{dayjs(date).format("DD/MM/YYYY")}</Text>
          {treatment.endDate && (
            <div>
              <Text type="secondary">
                Kết thúc: {dayjs(treatment.endDate).format("DD/MM/YYYY")}
              </Text>
            </div>
          )}
          {treatment.createdDate && (
            <div>
              <Text type="secondary">
                Tạo: {dayjs(treatment.createdDate).format("DD/MM/YYYY")}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, treatment) => (
        <div>
          {getStatusTag(status)}
          {treatment.notes && (
            <div>
              <Text type="secondary">{treatment.notes}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, treatment) => (
        <div>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => viewRecord(treatment)}                            // View treatment detail
            style={{ width: "100%", marginBottom: 4 }}
          >
            Xem chi tiết
          </Button>
          {treatment.status === "PENDING" && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                onClick={() => handleApprove(treatment)}                     // Approve treatment
                style={{
                  width: "100%",
                  background: "#28a745",
                  borderColor: "#28a745",
                  marginBottom: 4,
                }}
              >
                Duyệt
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                onClick={() => handleCancel(treatment)}                      // Cancel treatment
                style={{ width: "100%" }}
              >
                Hủy
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // ===== FILTER FUNCTION =====
  // Hàm filter records theo search text và status
  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.customerName
      .toLowerCase()
      .includes(searchText.toLowerCase());                                   // Filter theo tên customer
    const matchesStatus =
      statusFilter === "all" ||
      record.treatments.some((treatment) => treatment.status === statusFilter); // Filter theo status
    return matchesSearch && matchesStatus;
  });

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div>
      {/* ===== MAIN CARD SECTION ===== */}
      {/* Card chính chứa search, filters và table */}
      <Card>
        {/* ===== SEARCH AND FILTER SECTION ===== */}
        {/* Phần search và filter controls */}
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="Tìm kiếm theo tên bệnh nhân..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}                  // Update search text
            allowClear
            style={{ width: 300 }}
          />

          <Button
            onClick={() => {
              setSearchText("");                                             // Clear search text
              setStatusFilter("all");                                        // Reset status filter
            }}
          >
            Đặt lại
          </Button>
        </Space>

        {/* ===== MAIN TABLE SECTION ===== */}
        {/* Bảng chính với expandable rows */}
        <Spin spinning={loading}>
          <Table
            columns={columns}                                                // Main table columns
            dataSource={filteredRecords}                                    // Filtered records data
            expandable={{
              expandedRowRender,                                             // Render function cho expanded rows
              expandedRowKeys: expandedRows,                                 // Keys của expanded rows
              onExpand: async (expanded, record) => {
                const customerId = record.customerId;

                if (expanded && !expandedRows.includes(record.key)) {
                  setExpandedRows([...expandedRows, record.key]);            // Add to expanded rows

                  // Nếu chưa có data thì gọi API
                  if (!treatmentDetails[customerId]) {
                    setLoadingRows((prev) => [...prev, customerId]);        // Add loading state

                    try {
                      const res =
                        await treatmentService.getTreatmentRecordsExpand({
                          customerId,
                          page: 0,
                          size: 100,
                        });

                      const data = res?.data?.result?.content || [];
                      const treatmentsWithKey = data.map((item) => ({
                        ...item,
                        key: item.id,
                      }));

                      setTreatmentDetails((prev) => ({
                        ...prev,
                        [customerId]: treatmentsWithKey,                     // Set treatments data
                      }));
                    } catch (error) {
                      notification.error({
                        message: "Lỗi khi tải chi tiết hồ sơ!",
                        description: error.message || "Vui lòng thử lại.",
                      });
                    } finally {
                      setLoadingRows((prev) =>
                        prev.filter((id) => id !== customerId)              // Remove loading state
                      );
                    }
                  }
                } else {
                  setExpandedRows(
                    expandedRows.filter((key) => key !== record.key)        // Remove from expanded rows
                  );
                }
              },
              expandIcon: () => {
                null;                                                        // Hide default expand icon
              },
            }}
            pagination={false}                                               // Disable built-in pagination
          />

          {/* Custom pagination controls */}
          <div className="flex justify-end mt-4">
            <Button
              disabled={currentPage === 0}                                  // Disable nếu ở trang đầu
              onClick={() => fetchRecords(currentPage - 1)}
              className="mr-2"
            >
              Trang trước
            </Button>
            <span className="px-4 py-1 bg-gray-100 rounded text-sm">
              Trang {currentPage + 1} / {totalPages}
            </span>
            <Button
              disabled={currentPage + 1 >= totalPages}                      // Disable nếu ở trang cuối
              onClick={() => fetchRecords(currentPage + 1)}
              className="ml-2"
            >
              Trang tiếp
            </Button>
          </div>
        </Spin>
      </Card>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default ManagerTreatmentRecords;
