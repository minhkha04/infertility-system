// components/TreatmentDetailRow.jsx
import React, { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Table, Button, Spin, notification, Tag } from "antd";
import { treatmentService } from "../../service/treatment.service";
import dayjs from "dayjs";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";

// ===== STATUS & RESULT MAPPING =====
// Map để dịch status codes thành text và màu sắc tiếng Việt
const statusMap = {
  PENDING: { text: "Đang chờ xử lý", color: "gold" },
  INPROGRESS: { text: "Đang điều trị", color: "blue" },
  CANCELLED: { text: "Đã hủy", color: "red" },
  COMPLETED: { text: "Hoàn thành", color: "green" },
  CONFIRMED: { text: "Đã xác nhận", color: "cyan" },
};

// Map để dịch result codes thành text và màu sắc
const resultMap = {
  SUCCESS: { text: "Thành công", color: "green" },
  FAILURE: { text: "Thất bại", color: "red" },
  UNDETERMINED: { text: "Chưa xác định", color: "gold" },
};

// ===== TABLE COLUMNS CONFIGURATION =====
// Hàm tạo cấu hình columns cho bảng treatment details
const columnsChiTiet = (viewRecord, handleApprove, handleCancelService) => [
  {
    title: "Dịch vụ",
    dataIndex: "serviceName",
    key: "serviceName",
  },
  {
    title: "Ngày bắt đầu",
    dataIndex: "startDate", 
    key: "startDate",
    render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "Không có"),
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      const item = statusMap[status] || { text: status, color: "default" };
      return <Tag color={item.color}>{item.text}</Tag>;
    },
  },
  {
    title: "Kết quả", 
    dataIndex: "result",
    key: "result",
    render: (result) => {
      const item = resultMap[result] || { text: result, color: "default" };
      return <Tag color={item.color}>{item.text}</Tag>;
    },
  },
  {
    title: "Thao tác",
    key: "action",
    render: (_, treatment) => (
      <div className="flex gap-2">
        {/* Button xem chi tiết treatment */}
        <Button icon={<EyeOutlined />} onClick={() => viewRecord(treatment)} />
        
        {/* Button approve - chỉ hiển thị cho status PENDING */}
        {treatment.status === "PENDING" && (
          <Button
            icon={<CheckOutlined />}
            onClick={() => handleApprove(treatment)}
          />
        )}
        
        {/* Button cancel - chỉ hiển thị cho treatments chưa hoàn thành/hủy */}
        {treatment.status !== "CANCELLED" &&
          treatment.status !== "COMPLETED" && (
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => handleCancelService(treatment)}
            />
          )}
      </div>
    ),
  },
];

export default function TreatmentDetailRow({
  customerId,              // ID khách hàng để filter treatments
  doctorId,                // ID bác sĩ để filter treatments
  viewRecord,              // Callback khi click xem chi tiết
  handleApprove,           // Callback khi approve treatment
  handleCancelService,     // Callback khi cancel treatment
}) {
  // ===== STATE MANAGEMENT =====
  const [recordExpand, setRecordExpand] = useState([]);             // State lưu expanded records

  // ===== API FUNCTION =====
  // Hàm fetch treatment details với pagination
  const fetchTreatmentDetails = async ({ pageParam = 0 }) => {
    try {
      // Gọi API lấy treatment records với expand details
      const res = await treatmentService.getTreatmentRecordsExpand({
        customerId,           // Filter theo customer
        doctorId,             // Filter theo doctor
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
        message: "Không thể tải dữ liệu",
      });
      return { list: [], hasNextPage: false };
    }
  };

  // ===== REACT QUERY INFINITE QUERY =====
  // Setup infinite query để load treatments với pagination
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["treatments", customerId],           // Query key với customerId
      queryFn: fetchTreatmentDetails,                 // Fetch function
      getNextPageParam: (lastPage, pages) =>         // Logic xác định next page param
        lastPage.hasNextPage ? pages.length : undefined,
      enabled: !!customerId && !!doctorId,           // Chỉ enabled khi có cả 2 IDs
      
      // Optimization settings để tránh refetch không cần thiết
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      staleTime: Infinity,                            // Cache permanently hoặc vài phút
    });

  // Flatten tất cả pages thành 1 mảng treatments
  const treatments = data?.pages.flatMap((page) => page.list) || [];

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div className="p-4 bg-white border rounded">
      {/* ===== LOADING WRAPPER ===== */}
      <Spin spinning={isLoading}>
        {/* ===== TREATMENTS TABLE ===== */}
        {/* Bảng hiển thị danh sách treatments với các actions */}
        <Table
          dataSource={treatments}                     // Data từ infinite query
          columns={columnsChiTiet(                    // Columns config với callbacks
            viewRecord,
            handleApprove,
            handleCancelService
          )}
          pagination={false}                          // Disable built-in pagination
          size="small"                                // Compact table size
          rowKey="id"                                 // Unique key cho mỗi row
        />
        
        {/* ===== LOAD MORE BUTTON ===== */}
        {/* Button "Xem thêm" để load next page */}
        {hasNextPage && (
          <div className="text-center mt-4">
            <Button
              onClick={() => {
                fetchNextPage();                       // Trigger fetch next page
                console.log(recordExpand);            // Debug log
              }}
              loading={isFetchingNextPage}            // Loading state
              disabled={recordExpand.length === 0}    // Disable nếu không có records
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
