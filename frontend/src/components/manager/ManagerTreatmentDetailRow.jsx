// components/ManagerTreatmentDetailRow.jsx
import React, { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Table, Button, Spin, notification, Tag, Typography } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { treatmentService } from "../../service/treatment.service";

const { Text } = Typography;

// ===== STATUS & RESULT MAPPING =====
// Map để dịch status codes thành text và màu sắc tiếng Việt
const statusMap = {
  PENDING: { text: "Đang chờ xử lý", color: "orange" },
  CONFIRMED: { text: "Đã xác nhận", color: "cyan" },
  INPROGRESS: { text: "Đang điều trị", color: "blue" },
  CANCELLED: { text: "Đã hủy", color: "red" },
  COMPLETED: { text: "Hoàn thành", color: "green" },
};

// Map để dịch result codes thành text và màu sắc
const resultMap = {
  SUCCESS: { text: "Thành công", color: "green" },
  FAILURE: { text: "Thất bại", color: "red" },
  UNDETERMINED: { text: "Chưa xác định", color: "gold" },
};

// ===== TABLE COLUMNS CONFIGURATION =====
// Hàm tạo cấu hình columns cho bảng treatment records (manager view)
const columnsChiTiet = (viewRecord, handleApprove, handleCancel) => [
  {
    title: "Dịch vụ",
    dataIndex: "treatmentServiceName",
    key: "treatmentServiceName",
    render: (text, treatment) => {
      // Lấy tên dịch vụ từ nhiều nguồn khác nhau
      const name =
        treatment.treatmentServiceName ||
        treatment.serviceName ||
        treatment.name ||
        treatment.treatmentService?.name ||
        "Chưa có thông tin";
      return (
        <div>
          <Text strong>{name}</Text>                          {/* Tên dịch vụ */}
          {/* Mô tả dịch vụ nếu có */}
          {treatment.treatmentServiceDescription && (
            <div>
              <Text type="secondary">
                {treatment.treatmentServiceDescription}
              </Text>
            </div>
          )}
          {/* Giá dịch vụ nếu có */}
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
    render: (_, treatment) => (
      <div>
        <Text strong>{treatment.doctorName || "Chưa có thông tin"}</Text>
        {/* Email bác sĩ nếu có */}
        {treatment.doctorEmail && (
          <div>
            <Text type="secondary">{treatment.doctorEmail}</Text>
          </div>
        )}
        {/* Số điện thoại bác sĩ nếu có */}
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
    render: (_, treatment) => (
      <div>
        <Text strong>{dayjs(treatment.startDate).format("DD/MM/YYYY")}</Text>
        {/* Ngày kết thúc nếu có */}
        {treatment.endDate && (
          <div>
            <Text type="secondary">
              Kết thúc: {dayjs(treatment.endDate).format("DD/MM/YYYY")}
            </Text>
          </div>
        )}
        {/* Ngày tạo record nếu có */}
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
    render: (status, treatment) => {
      const s = statusMap[status] || { text: status, color: "default" };
      return (
        <div>
          <Tag color={s.color}>{s.text}</Tag>
          {/* Ghi chú treatment nếu có */}
          {treatment.notes && (
            <div>
              <Text type="secondary">{treatment.notes}</Text>
            </div>
          )}
        </div>
      );
    },
  },
  {
    title: "Kết quả",
    dataIndex: "result",
    key: "result",
    render: (result) => {
      const s = resultMap[result] || { text: result, color: "default" };
      return (
        <div>
          <Tag color={s.color}>{s.text}</Tag>
        </div>
      );
    },
  },
  {
    title: "Thao tác",
    key: "action",
    render: (_, treatment) => (
      <div>
        {/* Button xem chi tiết - luôn hiển thị */}
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => viewRecord(treatment)}
          style={{ width: "100%", marginBottom: 4 }}
        >
          Xem chi tiết
        </Button>
        
        {/* Buttons approve/cancel - chỉ hiển thị cho status PENDING */}
        {treatment.status === "PENDING" && (
          <>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              onClick={() => handleApprove(treatment)}          // Handler approve treatment
              style={{
                width: "100%",
                background: "#28a745",                          // Green approve button
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
              onClick={() => handleCancel(treatment)}           // Handler cancel treatment
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

export default function ManagerTreatmentDetailRow({
  customerId,          // ID khách hàng để filter treatments
  viewRecord,          // Callback khi click xem chi tiết
  handleApprove,       // Callback khi approve treatment
  handleCancel,        // Callback khi cancel treatment
}) {
  // ===== STATE MANAGEMENT =====
  const [recordExpand, setRecordExpand] = useState([]);             // State lưu expanded records

  // ===== API FUNCTION =====
  // Hàm fetch treatment records với pagination
  const fetchTreatments = async ({ pageParam = 0 }) => {
    try {
      // Gọi API lấy treatment records với expand details
      const res = await treatmentService.getTreatmentRecordsExpand({
        customerId,           // Filter theo customer
        page: pageParam,      // Page số (0-based)
        size: 5,              // Số items per page
      });
      const data = res?.data?.result;
      setRecordExpand(data.content);        // Update expanded records state
      
      return {
        list: data?.content || [],          // Danh sách treatments
        hasNextPage: !data?.last,          // Còn page tiếp theo không
      };
    } catch (err) {
      notification.error({
        message: "Không thể tải dữ liệu chi tiết",
      });
      return { list: [], hasNextPage: false };
    }
  };

  // ===== REACT QUERY INFINITE QUERY =====
  // Setup infinite query để load treatments với pagination
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["manager-treatments", customerId],           // Query key với customerId
      queryFn: fetchTreatments,                               // Fetch function
      getNextPageParam: (_, allPages) => allPages.length,    // Logic xác định next page param
      enabled: !!customerId,                                 // Chỉ enabled khi có customerId
      
      // Optimization settings để tránh refetch không cần thiết
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      staleTime: Infinity,                                    // Cache permanently hoặc vài phút
    });

  // Flatten tất cả pages thành 1 mảng treatments
  const treatments = data?.pages.flatMap((page) => page.list) || [];

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div className="p-4 bg-white border rounded">
      {/* ===== LOADING WRAPPER ===== */}
      <Spin spinning={isLoading}>
        {/* ===== TREATMENTS TABLE ===== */}
        {/* Bảng hiển thị danh sách treatments với các actions cho manager */}
        <Table
          dataSource={treatments}                             // Data từ infinite query
          columns={columnsChiTiet(viewRecord, handleApprove, handleCancel)}  // Columns config với callbacks
          pagination={false}                                  // Disable built-in pagination
          size="small"                                        // Compact table size
          rowKey="id"                                         // Unique key cho mỗi row
        />
        
        {/* ===== LOAD MORE BUTTON ===== */}
        {/* Button "Xem thêm" để load next page */}
        {hasNextPage && (
          <div className="text-center mt-4">
            <Button
              onClick={() => fetchNextPage()}                 // Trigger fetch next page
              loading={isFetchingNextPage}                    // Loading state
              disabled={recordExpand.length === 0}            // Disable nếu không có records
            >
              {isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
            </Button>
          </div>
        )}
      </Spin>
    </div>
  );
}

// ===== EXPORT COMPONENT =====
// Component được export default để sử dụng trong các pages khác
