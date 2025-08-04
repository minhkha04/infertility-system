import React, { useEffect, useState, useContext } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Modal,
  Input,
  Spin,
  Space,
  Typography,
  Descriptions,
  Avatar,
  Timeline,
  Divider,
  Tooltip,
} from "antd";
import { treatmentService } from "../../service/treatment.service";
import { authService } from "../../service/auth.service";
import { http } from "../../service/config";
import dayjs from "dayjs";
import {
  UserOutlined,
  CalendarOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { NotificationContext } from "../../App";

const { Text } = Typography;

const ChangeRequests = () => {
  // ===== STATE MANAGEMENT =====
  // State quản lý loading và data
  const [loading, setLoading] = useState(true);                              // Loading state chính
  const [requests, setRequests] = useState([]);                              // Danh sách change requests
  const [selected, setSelected] = useState(null);                           // Request được chọn trong modal
  
  // State quản lý modal
  const [modalVisible, setModalVisible] = useState(false);                   // Hiển thị modal
  const [actionLoading, setActionLoading] = useState(false);                 // Loading khi xử lý action
  const [notes, setNotes] = useState("");                                    // Notes khi approve/reject
  const [actionType, setActionType] = useState(null);                       // Loại action hiện tại
  
  // State quản lý doctor và pagination
  const [doctorId, setDoctorId] = useState(null);                           // ID của doctor hiện tại
  const [currentPage, setCurrentPage] = useState(0);                        // Trang hiện tại (0-based)
  const [totalPages, setTotalPages] = useState(1);                          // Tổng số trang

  // ===== CONTEXT =====
  const { showNotification } = useContext(NotificationContext);              // Context hiển thị thông báo

  // ===== USEEFFECT: TẢI THÔNG TIN DOCTOR =====
  // useEffect này chạy khi component mount để lấy doctor ID
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await authService.getMyInfo();                          // Gọi API lấy thông tin user
        setDoctorId(res?.data?.result?.id);                                 // Set doctor ID
      } catch {}
    };
    fetchDoctor();
  }, []);

  // ===== USEEFFECT: TẢI REQUESTS KHI CÓ DOCTOR ID =====
  // useEffect này chạy khi có doctorId để load change requests
  useEffect(() => {
    if (doctorId) fetchRequests();                                          // Load requests khi có doctor ID
    // eslint-disable-next-line
  }, [doctorId]);

  // ===== API FUNCTION: FETCH CHANGE REQUESTS =====
  // Hàm lấy danh sách change requests với pagination
  const fetchRequests = async (page = 0) => {
    setLoading(true);
    try {
      // Bước 1: Lấy danh sách PENDING_CHANGE appointments cho doctor này
      const changeRequestsResponse = await treatmentService.getAppointments({
        status: "PENDING_CHANGE",
        doctorId: doctorId,
        page,
        size: 5,
      });
      setCurrentPage(page);                                                 // Update current page
      setTotalPages(changeRequestsResponse.data.result.totalPages);         // Update total pages
      const pendingChangeAppointments =
        changeRequestsResponse?.data?.result?.content || [];
      console.log(
        "✅ PENDING_CHANGE appointments found for doctor:",
        pendingChangeAppointments.length
      );

      // Bước 2: Lấy thông tin chi tiết cho từng PENDING_CHANGE appointment
      const detailedChangeRequests = [];
      for (const appointment of pendingChangeAppointments) {
        try {
          // Gọi API lấy chi tiết từng appointment
          const detailResponse = await http.get(
            `v1/appointments/${appointment.id}`
          );
          const detailData = detailResponse?.data?.result;
          if (detailData) {
            // Merge thông tin từ cả 2 API để có đầy đủ data
            const mergedData = {
              ...appointment,
              ...detailData,
              customerName: detailData.customerName || appointment.customerName,
              doctorName: detailData.doctorName || appointment.doctorName,
              appointmentDate:
                detailData.appointmentDate || appointment.appointmentDate,
              shift: detailData.shift || appointment.shift,
              purpose: appointment.purpose,
              step: appointment.step,
              recordId: appointment.recordId,
              requestedDate:
                detailData.requestedDate || appointment.requestedDate,
              requestedShift:
                detailData.requestedShift || appointment.requestedShift,
            };
            detailedChangeRequests.push(mergedData);
          }
        } catch (error) {
          console.warn(
            `Failed to get details for appointment ${appointment.id}:`,
            error
          );
          // Fallback: sử dụng data từ API đầu tiên nếu không lấy được detail
          detailedChangeRequests.push(appointment);
        }
      }

      console.log(
        "✅ Detailed change requests loaded for doctor:",
        detailedChangeRequests.length
      );
      setRequests(detailedChangeRequests);                                  // Set requests data
    } catch (err) {
      showNotification("Không thể tải yêu cầu đổi lịch!", "error");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== MODAL HANDLERS =====
  
  // Hàm hiển thị modal chi tiết request
  const showDetail = (record) => {
    setSelected(record);                                                    // Set request được chọn
    setModalVisible(true);                                                  // Mở modal
    setActionType(null);                                                    // Reset action type
    setNotes("");                                                           // Reset notes
  };

  // Hàm hiển thị modal approve
  const handleApproveClick = (record) => {
    setSelected(record);                                                    // Set request được chọn
    setModalVisible(true);                                                  // Mở modal
    setActionType("CONFIRMED");                                             // Set action type approve
    setNotes("");                                                           // Reset notes
  };

  // Hàm hiển thị modal reject
  const handleRejectClick = (record) => {
    setSelected(record);                                                    // Set request được chọn
    setModalVisible(true);                                                  // Mở modal
    setActionType("REJECTED");                                              // Set action type reject
    setNotes("");                                                           // Reset notes
  };

  // ===== HANDLER: PROCESS ACTION =====
  // Hàm xử lý approve/reject change request
  const handleAction = async (actionTypeParam) => {
    if (!notes || !notes.trim()) {                                         // Validate notes required
      showNotification("Vui lòng nhập ghi chú!", "error");
      return;
    }
    if (!selected) return;

    // Sử dụng tham số truyền vào thay vì state actionType
    const finalActionType = actionTypeParam || actionType;

    // Set actionType cho loading indicator
    setActionType(finalActionType);
    setActionLoading(true);
    try {
      // Gọi API confirm change request
      await treatmentService.confirmAppointmentChange(selected.id, {
        status: finalActionType,
        note: notes,
      });
      
      showNotification(
        finalActionType === "PLANED"
          ? "Đã duyệt yêu cầu!"
          : "Đã từ chối yêu cầu!",
        "success"
      );
      
      setModalVisible(false);                                               // Đóng modal
      setNotes("");                                                         // Reset notes
      setActionType(null);                                                  // Reset action type
      fetchRequests();                                                      // Refresh requests list
    } catch (err) {
      showNotification("Không thể cập nhật yêu cầu!", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ===== TABLE COLUMNS CONFIGURATION =====
  // Cấu hình các columns cho bảng change requests
  const columns = [
    {
      title: "Bệnh nhân",
      dataIndex: "customerName",
      key: "customerName",
      render: (name, record) => (
        <Space>
          <div>
            <Text strong>{name}</Text>
            {record.customerEmail && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.customerEmail}                                    {/* Email bệnh nhân */}
                </Text>
              </>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctorName",
      key: "doctorName",
      render: (name, record) => (
        <Space>
          <div>
            <Text strong>{name}</Text>
            {record.doctorEmail && (
              <>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.doctorEmail}                                      {/* Email bác sĩ */}
                </Text>
              </>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Lịch hiện tại",
      key: "currentSchedule",
      render: (_, record) => (
        <div>
          <div>
            {record.appointmentDate
              ? dayjs(record.appointmentDate).format("DD/MM/YYYY")         // Format ngày hiện tại
              : ""}
          </div>
          <Tag color="blue">
            {record.shift === "MORNING"
              ? "Sáng"
              : record.shift === "AFTERNOON"
              ? "Chiều"
              : record.shift}                                               {/* Ca hiện tại */}
          </Tag>
        </div>
      ),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestedDate",
      key: "requestedDate",
      render: (t) =>
        t ? (
          <Text style={{ color: "#faad14" }}>
            {dayjs(t).format("DD/MM/YYYY")}                                 {/* Ngày yêu cầu đổi */}
          </Text>
        ) : (
          <Text type="secondary">Chưa có</Text>
        ),
    },
    {
      title: "Ca yêu cầu",
      dataIndex: "requestedShift",
      key: "requestedShift",
      // Ca yêu cầu đổi - render text dựa trên shift value
      render: (s) =>
        s ? (
          s === "MORNING" ? (
            "Sáng"
          ) : s === "AFTERNOON" ? (
            "Chiều"
          ) : (
            s
          )
        ) : (
          <Text type="secondary">Chưa có</Text>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => showDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div>
      {/* ===== MAIN CARD SECTION ===== */}
      {/* Card chính chứa bảng change requests */}
      <Card
        title={
          <Space>
            <span>Yêu cầu đổi lịch hẹn từ khách hàng</span>
          </Space>
        }
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
        styles={{ body: { padding: 24 } }}
        hoverable
      >
        {/* ===== TABLE SECTION ===== */}
        {/* Bảng hiển thị danh sách change requests với loading và pagination */}
        <Spin spinning={loading} tip="Đang tải...">
          <Table
            columns={columns}                                               // Columns configuration
            dataSource={requests}                                          // Data change requests
            rowKey="id"                                                     // Unique key cho mỗi row
            pagination={false}                                              // Disable built-in pagination
            bordered
            size="middle"
            style={{ background: "white", borderRadius: 8 }}
            scroll={{ x: "max-content" }}                                  // Horizontal scroll
          />
          
          {/* Custom pagination controls */}
          <div className="flex justify-end mt-4">
            <Button
              disabled={currentPage === 0}                                 // Disable nếu ở trang đầu
              onClick={() => fetchRequests(currentPage - 1)}
              className="mr-2"
            >
              Trang trước
            </Button>
            <span className="px-4 py-1 bg-gray-100 rounded text-sm">
              Trang {currentPage + 1} / {totalPages}
            </span>
            <Button
              disabled={currentPage + 1 >= totalPages}                     // Disable nếu ở trang cuối
              onClick={() => fetchRequests(currentPage + 1)}
              className="ml-2"
            >
              Trang tiếp
            </Button>
          </div>
        </Spin>
        
        {/* ===== DETAIL MODAL ===== */}
        {/* Modal hiển thị chi tiết change request và approve/reject actions */}
        <Modal
          title="Chi tiết yêu cầu đổi lịch"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}                                                     // Custom footer
          centered
          width={500}
        >
          {selected && (
            <div style={{ padding: 8 }}>
              {/* ===== REQUEST DETAILS ===== */}
              {/* Hiển thị thông tin chi tiết của change request */}
              <Descriptions
                column={1}
                size="small"
                bordered
                style={{ marginBottom: 16 }}
              >
                <Descriptions.Item label="Bệnh nhân">
                  <Space>
                    <Text strong>{selected.customerName}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Bác sĩ">
                  <Space>
                    <Text strong>{selected.doctorName}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Lịch hiện tại">
                  <div>
                    {selected.appointmentDate
                      ? dayjs(selected.appointmentDate).format("DD/MM/YYYY")
                      : ""}
                  </div>
                  <Tag color="blue">
                    {selected.shift === "MORNING"
                      ? "Sáng"
                      : selected.shift === "AFTERNOON"
                      ? "Chiều"
                      : selected.shift}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày yêu cầu">
                  {selected.requestedDate ? (
                    <Text style={{ color: "#faad14" }}>
                      {dayjs(selected.requestedDate).format("DD/MM/YYYY")}
                    </Text>
                  ) : (
                    <Text type="secondary">Chưa có</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Ca yêu cầu">
                  {selected.requestedShift ? (
                    selected.requestedShift === "MORNING" ? (
                      "Sáng"
                    ) : selected.requestedShift === "AFTERNOON" ? (
                      "Chiều"
                    ) : (
                      selected.requestedShift
                    )
                  ) : (
                    <Text type="secondary">Chưa có</Text>
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="Lý do thay đổi">
                  <Tooltip title={selected.reasonChange}>
                    <Text ellipsis style={{ maxWidth: 500 }}>
                      {selected.reasonChange || "Chưa có"}
                    </Text>
                  </Tooltip>
                </Descriptions.Item>
              </Descriptions>
              
              {/* ===== ACTION SECTION ===== */}
              {/* Phần nhập notes và buttons approve/reject */}
              <Divider />
              <Input.TextArea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập lí do bắt buộc"
                style={{ marginBottom: 16 }}
              />
              
              {/* Action buttons */}
              <Space style={{ width: "100%", justifyContent: "center" }}>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={actionLoading && actionType === "PLANED"}
                  onClick={() => handleAction("PLANED")}
                  style={{ minWidth: 120 }}
                >
                  Duyệt yêu cầu
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  loading={actionLoading && actionType === "REJECTED"}
                  onClick={() => handleAction("REJECTED")}
                  style={{ minWidth: 120 }}
                >
                  Từ chối yêu cầu
                </Button>
              </Space>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default ChangeRequests;
