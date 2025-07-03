import { useEffect, useState } from "react";
import { authService } from "../../service/auth.service";
import { treatmentService } from "../../service/treatment.service";
import { Modal, Descriptions, Button, Tag } from "antd";
import {
  EyeOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
const AppointmentSchedule = () => {
  const [infoUser, setInfoUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentDetail, setAppointmentDetail] = useState(null);

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
      default:
        return "Không xác định";
    }
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

  useEffect(() => {
    if (!infoUser?.id) return;
    treatmentService
      .getAppointmentBycustomer(infoUser.id, 0, 5)
      .then((res) => {
        setAppointments(res?.data?.result?.content || []);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy appointment:", err);
      });
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

  return (
    <div className="p-6">
      <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
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
                    {item.appointmentDate}
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
                  colSpan="5"
                  className="text-center px-6 py-4 text-sm text-gray-500"
                >
                  Không có lịch hẹn nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Modal
          open={isModalOpen}
          title={
            <span className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
              <InfoCircleOutlined />
              Chi tiết lịch hẹn
            </span>
          }
          onCancel={() => setIsModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalOpen(false)}>
              Đóng
            </Button>,
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
                <Tag color="blue">
                  {translateShift(appointmentDetail.shift)}
                </Tag>
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

              <Descriptions.Item label="Ngày hẹn">
                <CalendarOutlined className="mr-1" />
                {appointmentDetail.appointmentDate}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày yêu cầu">
                {appointmentDetail.requestedDate || (
                  <Tag color="default">Không có</Tag>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tạo">
                {appointmentDetail.createdAt}
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
                  <span className="text-gray-800">
                    {appointmentDetail.notes}
                  </span>
                ) : (
                  <Tag color="default">Không có</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AppointmentSchedule;
