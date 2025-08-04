import React, { useContext, useEffect, useState } from "react";
import { Card, Typography, Modal } from "antd";
import { useFormik } from "formik";
import InputCustom from "../Input/InputCustom";
import { blogService } from "../../service/blog.service";
import { useNavigate, useLocation } from "react-router-dom";
import { NotificationContext } from "../../App";
import * as yup from "yup";
import { FileTextOutlined, CloseOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { authService } from "../../service/auth.service";

/**
 * ✍️ CREATE BLOG COMPONENT - TRANG TẠO BLOG ĐỘC LẬP
 * 
 * Chức năng chính:
 * - Trang tạo blog riêng biệt cho tất cả user
 * - Sử dụng Formik cho form validation
 * - Có 3 action: Lưu nháp, Gửi duyệt, Hủy
 * - Modal xác nhận khi thoát có dữ liệu
 * 
 * Workflow:
 * 1. Load user info
 * 2. Validate form với Yup
 * 3. Submit form với Formik
 * 4. Handle save draft hoặc submit for review
 * 5. Navigate về dashboard tương ứng
 */

const { Title } = Typography;

const CreateBlogPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);
  const token = useSelector((state) => state.authSlice);
  const [currentUser, setCurrentUser] = useState(null);
  const [isExitModalVisible, setIsExitModalVisible] = useState(false);

  const getDashboardPath = (role) => {
    switch (role) {
      case "manager":
        return "/manager/dashboard";
      case "doctor":
        return "/doctor-dashboard";
      case "customer":
        return "/customer-dashboard";
      default:
        return "/"; // Hoặc trang lỗi/đăng nhập nếu vai trò không xác định
    }
  };

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        if (token?.token) {
          const response = await authService.getMyInfo(token.token);
          setCurrentUser(response.data.result);
        }
      } catch (error) {
        console.error("Error loading user info:", error);
        showNotification("Vui lòng đăng nhập để tạo bài viết", "error");
        navigate("/sign-in");
      }
    };
    loadUserInfo();
  }, [token, navigate, showNotification]);

  const { handleSubmit, handleChange, values, errors, touched, handleBlur } =
    useFormik({
      initialValues: {
        title: "",
        content: "",
        sourceReference: "",
      },
      onSubmit: async (values, { setSubmitting }) => {
        try {
          if (!currentUser) {
            showNotification("Vui lòng đăng nhập để tạo bài viết", "error");
            navigate("/sign-in");
            return;
          }

          const response = await blogService.createBlog({
            title: values.title,
            content: values.content,
            sourceReference: values.sourceReference,
            status: "pending",
          });
          if (response.data) {
            showNotification(
              "Bài viết đã được gửi, chờ quản lý duyệt!",
              "success"
            );
            navigate(getDashboardPath(currentUser.role));
          }
        } catch (error) {
          console.error("Blog create error:", error);
          if (error.response?.data?.message) {
            showNotification(error.response.data.message, "error");
          } else {
            showNotification(
              "Tạo bài viết thất bại. Vui lòng thử lại!",
              "error"
            );
          }
        } finally {
          setSubmitting(false);
        }
      },
      validationSchema: yup.object({
        title: yup.string().required("Vui lòng nhập tiêu đề!"),
        content: yup.string().required("Vui lòng nhập nội dung!"),
        sourceReference: yup
          .string()
          .required("Vui lòng nhập nguồn tham khảo!"),
      }),
    });

  const handleSaveDraft = async () => {
    try {
      if (!currentUser) {
        showNotification("Vui lòng đăng nhập để tạo bài viết", "error");
        navigate("/sign-in");
        return;
      }

      const response = await blogService.createBlog({
        title: values.title,
        content: values.content,
        sourceReference: values.sourceReference,
        status: "draft",
      });
      if (response.data) {
        showNotification("Bài viết đã được lưu dưới dạng nháp!", "success");
        navigate(getDashboardPath(currentUser.role));
      }
    } catch (error) {
      console.error("Blog draft error:", error);
      if (error.response?.data?.message) {
        showNotification(error.response.data.message, "error");
      } else {
        showNotification("Lưu nháp thất bại. Vui lòng thử lại!", "error");
      }
    }
  };

  const handleExit = () => {
    if (values.title || values.content || values.sourceReference) {
      setIsExitModalVisible(true);
    } else {
      navigate(getDashboardPath(currentUser?.role));
    }
  };

  const handleExitConfirm = async (saveDraft) => {
    if (saveDraft) {
      await handleSaveDraft();
    } else {
      navigate(getDashboardPath(currentUser?.role));
    }
    setIsExitModalVisible(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card
        bordered
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileTextOutlined className="text-blue-600 text-xl" />
              <Title level={4} className="!mb-0">
                Tạo Bài Viết Blog
              </Title>
            </div>
            <button
              onClick={handleExit}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <CloseOutlined className="text-xl" />
            </button>
          </div>
        }
        className="shadow-lg border border-gray-200"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputCustom
            labelContent="Tiêu đề bài viết"
            name="title"
            placeholder="Nhập tiêu đề bài viết"
            value={values.title}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.title}
            touched={touched.title}
          />

          <InputCustom
            labelContent="Nội dung"
            name="content"
            typeInput="textarea"
            placeholder="Nhập nội dung bài viết"
            value={values.content}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.content}
            touched={touched.content}
          />

          <InputCustom
            labelContent="Nguồn tham khảo"
            name="sourceReference"
            placeholder="Nhập nguồn tham khảo"
            value={values.sourceReference}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.sourceReference}
            touched={touched.sourceReference}
          />

          <div className="flex justify-center space-x-4 pt-4">
            <button
              type="button"
              onClick={handleExit}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-semibold hover:bg-gray-300 transition"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="bg-gray-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-600 transition"
            >
              Lưu
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
            >
              Gửi duyệt
            </button>
          </div>
        </form>
      </Card>

      <Modal
        title="Xác nhận thoát"
        open={isExitModalVisible}
        onCancel={() => setIsExitModalVisible(false)}
        footer={[
          <button
            key="cancel"
            onClick={() => setIsExitModalVisible(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Hủy
          </button>,
          <button
            key="exit"
            onClick={() => handleExitConfirm(false)}
            className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
          >
            Thoát không lưu
          </button>,
          <button
            key="save"
            onClick={() => handleExitConfirm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Lưu nháp và thoát
          </button>,
        ]}
      >
        <p>Bạn có muốn lưu bài viết dưới dạng nháp trước khi thoát không?</p>
      </Modal>
    </div>
  );
};

export default CreateBlogPage;
