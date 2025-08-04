import { useContext, useEffect, useRef, useState } from "react";
import { authService } from "../../service/auth.service";
import { treatmentService } from "../../service/treatment.service";
import { Modal, Descriptions, Button, Tag, Input, Space, Select } from "antd";
import {
  EyeOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { NotificationContext } from "../../App";
const AppointmentSchedule = () => {
  const [infoUser, setInfoUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentDetail, setAppointmentDetail] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [note, setNote] = useState("");
  const { showNotification } = useContext(NotificationContext);
  const [isModalOpenUpdate, setIsModalOpenUpdate] = useState(false);
  const [loadingIds, setLoadingIds] = useState([]);
  const [changeRequestForm, setChangeRequestForm] = useState({
    requestedDate: null,
    requestedShift: "",
    notes: "",
  });
  const [currentPage, setCurrentPage] = useState(0); // backend page = 0-based
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");

  const translateShift = (shift) => {
    switch (shift) {
      case "MORNING":
        return "Buổi sáng";
      case "AFTERNOON":
        return "Buổi chiều";
      default:
        return "Không xác định";
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "COMPLETED":
        return "Đã hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "PLANED":
        return "Đã lên lịch";
      case "PENDING_CHANGE":
        return "Chờ duyệt đổi lịch";
      case "REJECTED":
        return "Từ chối yêu cầu đổi lịch";
      default:
        return "Không xác định";
    }
  };

  const STATUS_OPTIONS = [
    { value: "", label: "Tất cả" },
    { value: "PLANED", label: "Đã lên lịch" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "COMPLETED", label: "Đã hoàn thành" },
    { value: "CANCELLED", label: "Đã hủy" },
    { value: "PENDING_CHANGE", label: "Yêu cầu thay đổi" },
    { value: "REJECTED", label: "Đã từ chối" },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Gọi API lấy thông tin user
  useEffect(() => {
    authService
      .getMyInfo()
      .then((res) => {
        setInfoUser(res.data.result);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy user:", err);
      });
  }, []);

  const getApointmentCustomer = async (page = 0, status = filterStatus) => {
    if (!infoUser?.id) return;
    try {
      const res = await treatmentService.getAppointmentBycustomer(
        infoUser.id,
        status,
        page,
        10
      );
      setTotalPages(res.data.result.totalPages);
      setCurrentPage(page);
      setAppointments(res.data?.result.content || []);
    } catch (error) {
      console.log(error);
      showNotification(error.response.data.mesage, "error");
    }
  };

  useEffect(() => {
    if (infoUser?.id) {
      getApointmentCustomer();
    }
  }, [infoUser]);

  const getAppointmentDetail = async (appointmentId) => {
    try {
      const res = await treatmentService.getAppointmentBycustomerDetail(
        appointmentId
      );
      setAppointmentDetail(res.data.result);
      setIsModalOpen(true);
    } catch (error) {
      console.log(error);
    }
  };

  // nút từ chối và update
  const openApprovalModal = (id, status) => {
    setCurrentId(id);
    setCurrentStatus(status);
    setModalVisible(true);
  };

  const updateAppointmentChange = async (appointmentId, payload) => {
    try {
      const res = await treatmentService.requestChangeAppointment(
        appointmentId,
        payload
      );
      console.log(res);
      showNotification("Yêu cầu thay đổi lịch thành công", "success");
    } catch (error) {
      console.log(error);
      showNotification(error.response.data.message, "error");
    }
  };

  return (
    <div className="">
      <div className="flex justify-end items-center px-6 py-4 border-b border-gray-200 rounded-t-md">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Lọc theo trạng thái:
          </span>
          <Select
            value={filterStatus}
            onChange={(value) => {
              setFilterStatus(value);
              getApointmentCustomer(0, value);
            }}
            size="middle"
            style={{ width: 200 }}
            options={STATUS_OPTIONS}
            placeholder="Chọn trạng thái"
            allowClear
          />
        </div>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 border-b border-gray-200 shadow-sm">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Bác sĩ
            </th>

            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Ca
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Ngày hẹn
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Bước điều trị
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Mục đích
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {appointments.length > 0 ? (
            appointments.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-all">
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.doctorName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                      item.shift === "MORNING"
                        ? "bg-blue-100 text-blue-800"
                        : item.shift === "AFTERNOON"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {translateShift(item.shift)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(item.appointmentDate)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-red-600 bg-red-200 py-0.5 px-2.5 rounded">
                    {item.step}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.purpose || "Không có"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      item.status === "CONFIRMED"
                        ? "bg-green-100 text-green-700"
                        : item.status === "COMPLETED"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {translateStatus(item.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button
                    icon={<EyeOutlined />}
                    size="small"
                    type="ghost"
                    onClick={() => getAppointmentDetail(item.id)}
                    className="!border !border-blue-500 !text-blue-600 hover:!text-white hover:!bg-blue-500 font-medium px-4 rounded transition duration-200"
                  >
                    Xem
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                className="text-center px-6 py-4 text-sm text-gray-500"
              >
                Không có lịch hẹn nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex justify-end my-3 mx-4">
        <Button
          disabled={currentPage === 0}
          onClick={() => getApointmentCustomer(currentPage - 1, filterStatus)}
          className="mr-2"
        >
          Trang trước
        </Button>
        <span className="px-4 py-1 bg-gray-100 rounded text-sm">
          Trang {currentPage + 1} / {totalPages}
        </span>
        <Button
          disabled={currentPage + 1 >= totalPages}
          onClick={() => getApointmentCustomer(currentPage + 1, filterStatus)}
          className="ml-2"
        >
          Trang tiếp
        </Button>
      </div>

      {/* modal xem chi tiết lịch hẹn */}

      <Modal
        open={isModalOpen}
        title={
          <span className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
            <InfoCircleOutlined />
            Chi tiết lịch hẹn
          </span>
        }
        onCancel={() => {
          setIsModalOpen(false);
          setAppointmentDetail(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>,
          (appointmentDetail?.status !== "PENDING_CHANGE" ||
            appointmentDetail?.status !== "COMPLETED") && (
            <Button
              danger
              onClick={() => {
                setIsModalOpenUpdate(true);
                setIsModalOpen(false);
              }}
            >
              Yêu cầu đổi lịch khám
            </Button>
          ),
          appointmentDetail?.status === "PLANED" && (
            <Button
              type="primary"
              onClick={async () => {
                try {
                  await treatmentService.updateAppointmentStatusCustomer(
                    appointmentDetail.id,
                    { status: "CONFIRMED", note: appointmentDetail.notes }
                  );
                  showNotification("Đã checkin thành công", "success");
                  getApointmentCustomer();
                  setIsModalOpen(false);
                } catch (err) {
                  console.error(err);
                  showNotification(err.response.data.message, "error");
                }
              }}
            >
              Xác nhận
            </Button>
          ),
        ]}
      >
        {appointmentDetail && (
          <Descriptions
            bordered
            size="middle"
            column={1}
            labelStyle={{
              width: "130px",
              background: "#f9fafb",
              fontWeight: "500",
            }}
            contentStyle={{ background: "#fff" }}
          >
            <Descriptions.Item label="Bác sĩ">
              <div className="space-y-1">
                <div>
                  <strong className="text-gray-700">Tên:</strong>{" "}
                  {appointmentDetail.doctorName}
                </div>
                <div>
                  <strong className="text-gray-700">Email:</strong>{" "}
                  {appointmentDetail.doctorEmail}
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Khách hàng">
              <div className="space-y-1">
                <div>
                  <strong className="text-gray-700">Tên:</strong>{" "}
                  {appointmentDetail.customerName}
                </div>
                <div>
                  <strong className="text-gray-700">Email:</strong>{" "}
                  {appointmentDetail.customerEmail}
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Ca">
              <Tag color="blue">{translateShift(appointmentDetail.shift)}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Ngày hẹn">
              {formatDate(appointmentDetail.appointmentDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Ca yêu cầu">
              {appointmentDetail.requestedShift ? (
                <Tag color="gold">
                  {translateShift(appointmentDetail.requestedShift)}
                </Tag>
              ) : (
                <Tag color="default">Không có</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày yêu cầu">
              {appointmentDetail.requestedDate || (
                <Tag color="default">Không có</Tag>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày tạo">
              {formatDate(appointmentDetail.createdAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  appointmentDetail.status === "CONFIRMED"
                    ? "green"
                    : appointmentDetail.status === "COMPLETED"
                    ? "orange"
                    : "red"
                }
              >
                {translateStatus(appointmentDetail.status)}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Ghi chú">
              {appointmentDetail.notes ? (
                <span className="text-gray-800">{appointmentDetail.notes}</span>
              ) : (
                <Tag color="default">Không có</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* modal gửi yêu cầu đổi lịch hẹn */}
      <Modal
        title="Gửi yêu cầu thay đổi lịch hẹn"
        open={isModalOpenUpdate}
        onCancel={() => setIsModalOpenUpdate(false)}
        onOk={async () => {
          if (!appointmentDetail?.id) return;
          const { requestedDate, requestedShift, notes } = changeRequestForm;

          if (!requestedDate || !requestedShift) {
            showNotification("Vui lòng chọn ngày và ca làm", "warning");
            return;
          }
          await updateAppointmentChange(appointmentDetail.id, {
            requestedDate,
            requestedShift,
            notes,
          });
          getApointmentCustomer();
          setIsModalOpenUpdate(false);
        }}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <label>Chọn ngày</label>
          <Input
            type="date"
            value={changeRequestForm.requestedDate || ""}
            onChange={(e) =>
              setChangeRequestForm((prev) => ({
                ...prev,
                requestedDate: e.target.value,
              }))
            }
          />

          <label>Chọn ca</label>
          <select
            className="w-full border border-gray-300 rounded px-2 py-1"
            value={changeRequestForm.requestedShift}
            onChange={(e) =>
              setChangeRequestForm((prev) => ({
                ...prev,
                requestedShift: e.target.value,
              }))
            }
          >
            <option value="">-- Chọn ca --</option>
            <option value="MORNING">Buổi sáng</option>
            <option value="AFTERNOON">Buổi chiều</option>
          </select>

          <label>Lí do</label>
          <Input.TextArea
            rows={4}
            placeholder="Nhập lí do (tuỳ chọn)"
            value={changeRequestForm.notes}
            onChange={(e) =>
              setChangeRequestForm((prev) => ({
                ...prev,
                notes: e.target.value,
              }))
            }
          />
        </Space>
      </Modal>
    </div>
  );
};

export default AppointmentSchedule;
