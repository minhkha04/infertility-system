import React, { useContext, useEffect, useState } from "react";
import { NotificationContext } from "../../App";
import { authService } from "../../service/auth.service";
import { customerService } from "../../service/customer.service";
import { Card, Modal, Rate } from "antd";
import Title from "antd/es/skeleton/Title";
import { UserAddOutlined } from "@ant-design/icons";
import { useFormik } from "formik";
import { useLocation } from "react-router-dom";

const FeedbackCustomer = () => {
  // ===== STATE MANAGEMENT =====
  // State quản lý user info và UI
  const [infoUser, setInfoUser] = useState();                       // Thông tin user customer hiện tại
  const [feedbacks, setFeedbacks] = useState([]);                   // Danh sách feedbacks của customer
  const [feedbackInfo, setFeedbackInfo] = useState(null);           // Thông tin để tạo feedback mới
  const [selectedFeedback, setSelectedFeedback] = useState(null);   // Feedback được chọn để xem
  const [feedbackDetails, setFeedbackDetails] = useState(null);     // Chi tiết feedback trong modal
  const [viewModalOpen, setViewModalOpen] = useState(false);        // Hiển thị modal xem chi tiết

  // ===== CONTEXT & LOCATION =====
  const { showNotification } = useContext(NotificationContext);     // Context hiển thị thông báo
  const { state } = useLocation();                                  // State từ navigation (chứa recordId)

  // ===== USEEFFECT: TẢI THÔNG TIN USER =====
  // useEffect này chạy khi component mount để lấy thông tin customer hiện tại
  useEffect(() => {
    authService
      .getMyInfo()                                                  // Gọi API lấy thông tin user
      .then((res) => {
        setInfoUser(res.data.result);                              // Set thông tin user vào state
      })
      .catch(() => {});                                            // Silent catch lỗi
  }, []);

  // ===== API FUNCTIONS =====
  
  // Hàm lấy tất cả feedbacks của customer với pagination
  const getAllFeedBack = async (page = 0) => {
    try {
      const res = await customerService.getAllFeedback(infoUser.id, page, 5);
      if (res?.data?.result?.content) {
        setFeedbacks(res.data.result.content);                     // Set danh sách feedbacks
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Hàm lấy chi tiết feedback theo ID
  const getFeedbackDetails = async (id) => {
    try {
      const res = await customerService.getFeedbackById(id);
      setFeedbackDetails(res.data.result);                         // Set chi tiết feedback cho modal
    } catch (error) {
      console.log(error);
    }
  };

  // ===== USEEFFECT: TẢI DANH SÁCH FEEDBACKS =====
  // useEffect này chạy khi có infoUser để lấy danh sách feedbacks
  useEffect(() => {
    if (infoUser?.id) {
      getAllFeedBack();                                            // Load feedbacks khi có user ID
    }
  }, [infoUser]);

  // ===== FORMIK FORM MANAGEMENT =====
  // Setup Formik để quản lý form tạo feedback mới
  const formik = useFormik({
    // Initial values cho form
    initialValues: {
      customerId: "",           // ID customer
      doctorId: "",             // ID bác sĩ
      serviceId: "",            // ID dịch vụ
      rating: "",               // Đánh giá (1-5 sao)
      comment: "",              // Bình luận chi tiết
      recordId: "",             // ID treatment record
    },
    
    // Submit handler - tạo feedback mới
    onSubmit: async (values) => {
      try {
        console.log(values);
        
        await customerService.createFeedback(values);              // Gọi API tạo feedback
        await getAllFeedBack();                                   // Refresh danh sách
        showNotification("Gửi phản hồi thành công!", "success");
        resetForm();                                              // Reset form về initial values
        setFeedbackInfo(null);                                    // Clear feedback info
      } catch (err) {
        console.log(err);
        showNotification(err.response.data.message, "error");
      }
    },
  });

  // Destructure Formik props
  const {
    handleSubmit,        // Handler submit form
    handleChange,        // Handler change input
    handleBlur,          // Handler blur input
    values,              // Giá trị hiện tại của form
    touched,             // Trường đã được touch
    errors,              // Lỗi validation
    setFieldValue,       // Setter cho field value
    resetForm,           // Reset form function
  } = formik;

  // ===== USEEFFECT: LOAD FEEDBACK INFO TỪ NAVIGATION STATE =====
  // useEffect này chạy khi có state.recordId để lấy thông tin tạo feedback
  useEffect(() => {
    const id = state?.recordId;
    if (!id) return;  // Không có recordId thì return
    
    const fetchFeedbackInfo = async () => {
      try {
        // Lấy thông tin cần thiết để tạo feedback từ recordId
        const res = await customerService.getFeedbackInfoToCreate(id);
        const { doctorId, customerId, serviceId, doctorFullName, serviceName } =
          res.data.result;
        
        // Lưu đầy đủ info vào state để render UI
        setFeedbackInfo({
          recordId: id,
          doctorId,
          customerId,
          serviceId,
          doctorFullName,                                          // Tên bác sĩ để hiển thị
          serviceName,                                             // Tên dịch vụ để hiển thị
        });

        // Gán các IDs cho Formik để submit
        setFieldValue("recordId", id);
        setFieldValue("doctorId", doctorId);
        setFieldValue("customerId", customerId);
        setFieldValue("serviceId", Number(serviceId));
      } catch (error) {
        showNotification(error?.response?.data?.message, "error");
      }
    };
    fetchFeedbackInfo();
  }, [state, setFieldValue]);

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ===== CREATE FEEDBACK SECTION ===== */}
      {/* Form tạo feedback mới - chỉ hiển thị khi có feedbackInfo */}
      {feedbackInfo ? (
        <Card bordered className="shadow-md border rounded-xl bg-white">
          <div className="flex items-center gap-3 mb-4">
            <UserAddOutlined className="text-blue-500 text-2xl" />
            <Title level={4} className="!mb-0 !text-blue-600 !font-bold">
              Gửi đánh giá dịch vụ
            </Title>
          </div>

          {/* ===== FEEDBACK INFO DISPLAY ===== */}
          {/* Hiển thị thông tin treatment record để customer biết đang feedback gì */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md mb-6 text-sm font-medium">
            <p>
              <span className="text-gray-600">👨‍⚕️ Bác sĩ:</span>{" "}
              <span className="text-black">{feedbackInfo.doctorFullName}</span>
            </p>
            <p>
              <span className="text-gray-600">💉 Dịch vụ:</span>{" "}
              <span className="text-black">{feedbackInfo.serviceName}</span>
            </p>
            <p>
              <span className="text-gray-600">📁 Hồ sơ:</span>{" "}
              <span className="text-black">{feedbackInfo.recordId}</span>
            </p>
          </div>

          {/* ===== FEEDBACK FORM ===== */}
          {/* Form tạo feedback với rating và comment */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating field */}
            <div>
              <label className="block font-semibold mb-1 text-gray-700">
                Đánh giá chất lượng
              </label>
              <Rate
                value={Number(values.rating)}
                onChange={(value) => setFieldValue("rating", value)}
                tooltips={["Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"]}
                className="text-xl"
              />
              {touched.rating && errors.rating && (
                <p className="text-red-500 text-xs mt-1">{errors.rating}</p>
              )}
            </div>

            {/* Comment field */}
            <div>
              <label
                htmlFor="comment"
                className="block font-semibold mb-1 text-gray-700"
              >
                Ghi chú chi tiết
              </label>
              <textarea
                name="comment"
                rows={5}
                placeholder="Viết nhận xét chi tiết của bạn tại đây..."
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={values.comment}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.comment && errors.comment && (
                <p className="text-red-500 text-xs mt-1">{errors.comment}</p>
              )}
            </div>

            {/* Submit button */}
            <div className="text-center pt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Gửi phản hồi
              </button>
            </div>
          </form>
        </Card>
      ) : (
        // Empty state khi không có feedbackInfo
        <div className="text-center text-gray-500 italic py-6">
          Vui lòng chọn một dịch vụ điều trị để gửi phản hồi.
        </div>
      )}

      {/* ===== FEEDBACKS LIST SECTION ===== */}
      {/* Bảng hiển thị danh sách feedbacks đã tạo */}
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-3 text-gray-700">
          Danh sách phản hồi
        </h3>
        <div className="overflow-x-auto rounded-xl border bg-white shadow-md">
          <table className="min-w-full text-sm text-gray-700 ">
            {/* Table header */}
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="py-2 px-3 font-semibold">#</th>
                <th className="py-2 px-3 font-semibold">Khách hàng</th>
                <th className="py-2 px-3 font-semibold">Bác sĩ</th>
                <th className="py-2 px-3 font-semibold">Đánh giá</th>
                <th className="py-2 px-3 font-semibold">Bình luận</th>
                <th className="py-2 px-3 font-semibold">Trạng thái</th>
                <th className="py-2 px-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            
            {/* Table body */}
            <tbody>
              {feedbacks.map((fb, index) => (
                <tr key={fb.id} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-3">{index + 1}</td>
                  <td className="py-2 px-3">{fb.customerFullName}</td>
                  <td className="py-2 px-3">{fb.doctorFullName}</td>
                  <td className="py-2 px-3">
                    <Rate disabled defaultValue={fb.rating} />      {/* Read-only rating */}
                  </td>
                  <td className="py-2 px-3">{fb.comment}</td>
                  <td className="py-2 px-3">
                    {/* Status với màu sắc tương ứng */}
                    <span
                      className={`text-sm font-medium ${
                        fb.status === "APPROVED"
                          ? "text-green-600"                       // Xanh cho approved
                          : fb.status === "REJECTED"
                          ? "text-red-500"                         // Đỏ cho rejected
                          : "text-yellow-500"                      // Vàng cho pending
                      }`}
                    >
                      {fb.status === "APPROVED"
                        ? "Đã chấp nhận"
                        : fb.status === "REJECTED"
                        ? "Đã từ chối"
                        : "Chờ duyệt"}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {/* Button xem chi tiết */}
                    <button
                      onClick={() => {
                        setSelectedFeedback(fb);               // Set feedback được chọn
                        setViewModalOpen(true);                // Mở modal
                        getFeedbackDetails(fb.id);             // Load chi tiết
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== FEEDBACK DETAIL MODAL ===== */}
      {/* Modal hiển thị và chỉnh sửa chi tiết feedback */}
      <Modal
        open={viewModalOpen}
        title="Chi tiết phản hồi"
        onCancel={() => setViewModalOpen(false)}
        footer={null}                                              // Custom footer
      >
        {feedbackDetails && (
          <div className="space-y-4">
            {/* ===== FEEDBACK DETAILS DISPLAY ===== */}
            {/* Hiển thị thông tin feedback hiện tại */}
            <div>
              <strong>Rating:</strong>{" "}
              <Rate disabled defaultValue={feedbackDetails.rating} />
            </div>

            <div>
              <strong>Comment:</strong> <span>{feedbackDetails.comment}</span>
            </div>

            <div>
              <strong>Note:</strong> <span>{feedbackDetails.note}</span>
            </div>

            <div>
              <strong>Status: </strong>
              <span
                className={`text-sm font-medium ${
                  feedbackDetails.status === "APPROVED"
                    ? "text-green-600"
                    : feedbackDetails.status === "REJECTED"
                    ? "text-red-500"
                    : "text-yellow-500"
                }`}
              >
                {feedbackDetails.status === "APPROVED"
                  ? "Đã chấp nhận"
                  : feedbackDetails.status === "REJECTED"
                  ? "Đã từ chối"
                  : "Chờ duyệt"}
              </span>
            </div>

            <div>
              <strong>Ngày duyệt:</strong>{" "}
              <span>{feedbackDetails.submitDate}</span>
            </div>

            <hr />

            {/* ===== UPDATE FEEDBACK SECTION ===== */}
            {/* Form cập nhật feedback trong modal */}
            <label className="block font-semibold mt-4">
              <strong>Cập nhật đánh giá</strong>
            </label>
            
            {/* Rating update */}
            <Rate
              value={feedbackDetails.rating}
              onChange={(value) =>
                setFeedbackDetails((prev) => ({ ...prev, rating: value }))
              }
            />
            
            {/* Comment update */}
            <textarea
              value={feedbackDetails.comment}
              onChange={(e) =>
                setFeedbackDetails((prev) => ({
                  ...prev,
                  comment: e.target.value,
                }))
              }
              rows={4}
              className="w-full border rounded p-2"
            />

            {/* Update button */}
            <button
              onClick={async () => {
                try {
                  // Gọi API cập nhật feedback
                  const res = await customerService.updateFeedback(
                    feedbackDetails.id,
                    {
                      rating: feedbackDetails.rating,
                      comment: feedbackDetails.comment,
                      recordId: feedbackDetails.id,
                    }
                  );

                  showNotification("Cập nhật thành công", "success");
                  await getAllFeedBack();                          // Refresh danh sách
                  setViewModalOpen(false);                         // Đóng modal
                } catch (err) {
                  console.error(err);
                  console.log(feedbackDetails.rating);
                  console.log(feedbackDetails.comment);
                  console.log(feedbackDetails.id);
                  showNotification("Cập nhật thất bại", "error");
                }
              }}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Cập nhật
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default FeedbackCustomer;
