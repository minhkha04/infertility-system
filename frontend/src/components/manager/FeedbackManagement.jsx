import React, { useContext, useEffect, useRef, useState } from "react";
import { Card, Button, Space, Tag, Select, Input, Rate, Modal } from "antd";
import dayjs from "dayjs";
import { managerService } from "../../service/manager.service";
import { authService } from "../../service/auth.service";
import { NotificationContext } from "../../App";

const FeedbackManagement = () => {
  // ===== STATE MANAGEMENT =====
  // State quản lý data
  const [feedbacks, setFeedbacks] = useState([]);                         // Danh sách feedbacks
  const [infoUser, setInfoUser] = useState();                            // Thông tin user manager hiện tại
  const [feedbackDetail, setFeedbackDetail] = useState(null);            // Chi tiết feedback trong modal
  const [loadingIds, setLoadingIds] = useState([]);                      // Loading state cho từng feedback
  
  // State quản lý filters
  const [filters, setFilters] = useState({
    keyword: "",              // Từ khóa tìm kiếm
    status: "",               // Filter theo trạng thái
  });
  
  // State quản lý modal
  const [modalVisible, setModalVisible] = useState(false);               // Hiển thị modal confirm action
  const [currentId, setCurrentId] = useState(null);                     // ID feedback đang xử lý
  const [currentStatus, setCurrentStatus] = useState("");               // Status action hiện tại
  const [detailModalVisible, setDetailModalVisible] = useState(false);  // Hiển thị modal chi tiết
  
  // State quản lý pagination
  const [currentPage, setCurrentPage] = useState(0);                    // Trang hiện tại (0-based)
  const [totalPages, setTotalPages] = useState(1);                      // Tổng số trang
  
  // ===== REF =====
  const noteRef = useRef("");                                            // Ref để lưu note khi approve/reject

  // ===== CONTEXT =====
  const { showNotification } = useContext(NotificationContext);          // Context hiển thị thông báo

  // ===== USEEFFECT: TẢI THÔNG TIN USER =====
  // useEffect này chạy khi component mount để lấy thông tin manager hiện tại
  useEffect(() => {
    authService
      .getMyInfo()                                                      // Gọi API lấy thông tin user
      .then((res) => {
        setInfoUser(res.data.result);                                   // Set thông tin user vào state
      })
      .catch(() => {});                                                 // Silent catch lỗi
  }, []);

  // ===== API FUNCTION: FETCH FEEDBACKS =====
  // Hàm lấy danh sách feedbacks với pagination
  const getAllFeedBack = async (page = 0) => {
    try {
      const res = await managerService.getAllFeedback(page, 10);        // Gọi API lấy feedbacks
      console.log(res);
      if (res?.data?.result?.content) {
        setFeedbacks(res.data.result.content);                          // Set danh sách feedbacks
        setTotalPages(res.data.result.totalPages);                      // Set total pages
        setCurrentPage(page);                                           // Set current page
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ===== API FUNCTION: FETCH FEEDBACK DETAIL =====
  // Hàm lấy chi tiết feedback theo ID
  const getFeedbackDetail = async (id) => {
    try {
      const res = await managerService.getFeedbackDetail(id);          // Gọi API lấy chi tiết feedback
      setFeedbackDetail(res.data.result);                              // Set chi tiết feedback
    } catch (error) {
      console.log(error);
    }
  };

  // ===== USEEFFECT: INITIAL DATA LOAD =====
  // useEffect này chạy khi component mount để load feedbacks
  useEffect(() => {
    getAllFeedBack();                                                   // Load feedbacks khi component mount
  }, []);

  // ===== HANDLER: OPEN APPROVAL MODAL =====
  // Hàm mở modal approve/reject feedback
  const openApprovalModal = (id, status) => {
    setCurrentId(id);                                                   // Set ID feedback đang xử lý
    setCurrentStatus(status);                                           // Set action status (APPROVED/REJECTED/HIDDEN)
    setModalVisible(true);                                              // Mở modal
  };

  // ===== FILTER FUNCTION =====
  // Hàm filter feedbacks theo keyword và status
  const filteredFeedbacks = feedbacks.filter((item) => {
    const doctorName = item.doctorFullName?.toLowerCase() || "";
    const customerName = item.customerName?.toLowerCase() || "";

    // Filter theo keyword (tên bác sĩ hoặc customer)
    const matchKeyword =
      filters.keyword === "" ||
      customerName.includes(filters.keyword) ||
      doctorName.includes(filters.keyword);

    // Filter theo status
    const matchStatus = filters.status === "" || item.status === filters.status;

    return matchKeyword && matchStatus;
  });

  // ===== STATISTICS CALCULATION =====
  // Tính toán statistics từ feedbacks data
  const totalFeedback = feedbacks.length;                              // Tổng số feedbacks
  const pendingFeedback = feedbacks.filter(
    (fb) => fb.status === "PENDING"
  ).length;                                                             // Số feedback chờ duyệt
  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((sum, fb) => sum + (fb.rating || 0), 0) /
          feedbacks.length
        ).toFixed(1)
      : "0.0";                                                          // Đánh giá trung bình

  // ===== HANDLER: OPEN DETAIL MODAL =====
  // Hàm mở modal xem chi tiết feedback
  const openDetailModal = async (feedback) => {
    try {
      await getFeedbackDetail(feedback.id);                            // Load chi tiết feedback
      setDetailModalVisible(true);                                     // Mở modal
    } catch (error) {
      console.log(error);
    }
  };

  // ===== UTILITY FUNCTIONS: STATUS MAPPING =====
  
  // Hàm lấy text hiển thị cho status
  const getStatusLabel = (status) => {
    switch (status) {
      case "APPROVED":
        return "Đã chấp nhận";
      case "REJECTED":
        return "Đã từ chối";
      case "HIDDEN":
        return "Đã ẩn";
      case "PENDING":
      default:
        return "Chờ duyệt";
    }
  };

  // Hàm lấy màu cho status tag
  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "green";
      case "REJECTED":
        return "red";
      case "HIDDEN":
        return "gray";
      case "PENDING":
      default:
        return "orange";
    }
  };

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div>
      {/* ===== MAIN CARD SECTION ===== */}
      {/* Card chính chứa danh sách feedbacks */}
      <Card title="Danh sách phản hồi khách hàng">
        {/* ===== FILTER SECTION ===== */}
        {/* Phần filter với search input và status select */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          {/* Search input */}
          <Input
            placeholder="Tìm theo tên bệnh nhân hoặc bác sĩ"
            allowClear
            className="w-full md:w-1/3"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                keyword: e.target.value.toLowerCase(),                   // Update keyword filter
              }))
            }
          />

          {/* Status filter select */}
          <Select
            placeholder="Lọc trạng thái"
            allowClear
            className="w-full md:w-1/4"
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))        // Update status filter
            }
          >
            <Select.Option value="">Tất cả trạng thái</Select.Option>
            <Select.Option value="APPROVED">Đã duyệt</Select.Option>
            <Select.Option value="PENDING">Chờ duyệt</Select.Option>
            <Select.Option value="REJECTED">Đã từ chối</Select.Option>
          </Select>
        </div>

        {/* ===== FEEDBACKS TABLE SECTION ===== */}
        {/* Bảng hiển thị danh sách feedbacks */}
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full text-sm text-left table-auto">
            {/* Table header */}
            <thead className="bg-gray-100 text-xs font-semibold text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3">Bệnh nhân</th>
                <th className="px-4 py-3">Bác sĩ</th>
                <th className="px-4 py-3">Đánh giá</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            
            {/* Table body */}
            <tbody className="divide-y divide-gray-200">
              {filteredFeedbacks.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{item.customerFullName}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {item.doctorFullName || "..."}
                  </td>
                  <td className="px-4 py-3">
                    <Rate disabled value={item.rating} />                     {/* Rating stars */}
                  </td>
                  <td className="px-4 py-3">
                    <Tag color={getStatusColor(item.status)}>
                      {getStatusLabel(item.status)}                           {/* Status tag */}
                    </Tag>
                  </td>

                  <td className="px-4 py-3">
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => openDetailModal(item)}                  // Xem chi tiết
                    >
                      Xem
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Custom pagination controls */}
          <div className="flex justify-end mt-4">
            <Button
              disabled={currentPage === 0}                               // Disable nếu ở trang đầu
              onClick={() => getAllFeedBack(currentPage - 1)}
              className="mr-2"
            >
              Trang trước
            </Button>
            <span className="px-4 py-1 bg-gray-100 rounded text-sm">
              Trang {currentPage + 1} / {totalPages}
            </span>
            <Button
              disabled={currentPage + 1 >= totalPages}                   // Disable nếu ở trang cuối
              onClick={() => getAllFeedBack(currentPage + 1)}
              className="ml-2"
            >
              Trang tiếp
            </Button>
          </div>
        </div>
        
        {/* ===== FEEDBACK DETAIL MODAL ===== */}
        {/* Modal hiển thị chi tiết feedback với action buttons */}
        <Modal
          title="Chi tiết phản hồi"
          open={detailModalVisible}
          onCancel={() => {
            setDetailModalVisible(false);                                // Đóng modal
            setFeedbackDetail(null);                                     // Clear feedback detail
          }}
          footer={
            feedbackDetail ? (
              <Space>
                {/* Actions cho PENDING status */}
                {feedbackDetail.status === "PENDING" && (
                  <>
                    <Button
                      danger
                      onClick={() =>
                        openApprovalModal(feedbackDetail.id, "REJECTED")     // Từ chối feedback
                      }
                    >
                      Từ chối
                    </Button>
                    <Button
                      loading={loadingIds.includes(feedbackDetail.id)}
                      type="primary"
                      onClick={() =>
                        openApprovalModal(feedbackDetail.id, "APPROVED")    // Duyệt feedback
                      }
                    >
                      Duyệt
                    </Button>
                  </>
                )}

                {/* Actions cho APPROVED status */}
                {feedbackDetail.status === "APPROVED" && (
                  <Button
                    style={{
                      backgroundColor: "#6c757d",
                      borderColor: "#6c757d",
                      color: "#fff",
                    }}
                    onClick={() =>
                      openApprovalModal(feedbackDetail.id, "HIDDEN")         // Ẩn feedback
                    }
                  >
                    Ẩn
                  </Button>
                )}

                {/* Actions cho REJECTED/HIDDEN status */}
                {(feedbackDetail.status === "REJECTED" ||
                  feedbackDetail.status === "HIDDEN") && (
                  <Button
                    type="primary"
                    onClick={() =>
                      openApprovalModal(feedbackDetail.id, "APPROVED")      // Duyệt lại feedback
                    }
                  >
                    Duyệt
                  </Button>
                )}
              </Space>
            ) : null
          }
        >
          {feedbackDetail ? (
            // Hiển thị chi tiết feedback
            <div className="space-y-3 text-sm">
              <p>
                <strong>Bệnh nhân:</strong> {feedbackDetail.customerName}
              </p>
              <p>
                <strong>Bác sĩ:</strong>{" "}
                {feedbackDetail.doctorName || "Không rõ"}
              </p>
              <p>
                <strong>Đánh giá:</strong>{" "}
                <Rate disabled value={feedbackDetail.rating} />
              </p>
              <p>
                <strong>Bình luận:</strong> {feedbackDetail.comment}
              </p>
              <p>
                <strong>Ngày gửi:</strong>{" "}
                {feedbackDetail.createdAt
                  ? dayjs(feedbackDetail.createdAt).format("DD/MM/YYYY")
                  : "Không có"}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {getStatusLabel(feedbackDetail.status)}
              </p>
              <p>
                <strong>Note:</strong> {feedbackDetail.note || "Không có"}
              </p>
              <p>
                <strong>Người duyệt:</strong>{" "}
                {feedbackDetail.approvedBy || "Chưa có"}
              </p>
            </div>
          ) : (
            <p className="italic text-gray-500">Đang tải chi tiết...</p>
          )}
        </Modal>

        {/* ===== CONFIRMATION MODAL ===== */}
        {/* Modal confirm approve/reject/hide feedback */}
        <Modal
          title={
            currentStatus === "APPROVED"
              ? "Duyệt phản hồi?"
              : "Từ chối phản hồi?"
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={async () => {
            if (!infoUser?.id || !currentId) return;

            setLoadingIds((prev) => [...prev, currentId]);               // Add loading state

            try {
              // Gọi API confirm feedback với note và status
              await managerService.confirmFeedback(currentId, {
                note: noteRef.current || "",
                status: currentStatus,
              });

              showNotification("Cập nhật phản hồi thành công", "success");
              getAllFeedBack();                                          // Refresh feedbacks list
            } catch (err) {
              console.error(err);
              showNotification(err.response.data.message, "error");
            } finally {
              setModalVisible(false);                                    // Đóng modal
              setDetailModalVisible(false);                              // Đóng detail modal
              setLoadingIds((prev) => prev.filter((id) => id !== currentId)); // Remove loading state
              noteRef.current = "";                                      // Reset note
            }
          }}
          okText="Xác nhận"
          cancelText="Huỷ"
        >
          {/* Textarea nhập note */}
          <Input.TextArea
            rows={4}
            placeholder="Nhập ghi chú"
            onChange={(e) => (noteRef.current = e.target.value)}
          />
        </Modal>
      </Card>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default FeedbackManagement;
