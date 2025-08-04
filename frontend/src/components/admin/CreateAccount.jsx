import React, { useContext } from "react";
import { Card, Select, Typography } from "antd";
import { useFormik } from "formik";
import InputCustom from "../Input/InputCustom";
import { adminService } from "../../service/admin.service";
import { useSelector } from "react-redux";
import { NotificationContext } from "../../App";
import * as yup from "yup";
import { UserAddOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const CreateAccount = () => {
  // ===== REDUX & CONTEXT =====
  const token = useSelector((state) => state.authSlice);               // Token từ Redux store
  const { showNotification } = useContext(NotificationContext);        // Context hiển thị thông báo

  // ===== FORMIK FORM MANAGEMENT =====
  // Setup Formik để quản lý form state, validation và submission
  const {
    handleSubmit,        // Handler submit form
    handleChange,        // Handler change input
    values,              // Giá trị hiện tại của form
    errors,              // Lỗi validation
    touched,             // Trường đã được touch
    handleBlur,          // Handler blur input
    setFieldValue,       // Setter cho field value
  } = useFormik({
    // Initial values cho form
    initialValues: {
      username: "",       // Tên đăng nhập
      password: "",       // Mật khẩu
      roleName: "",       // Vai trò: admin/manager/doctor
    },
    
    // Submit handler - gọi API tạo user mới
    onSubmit: (values) => {
      adminService
        .createUser(values, token.token)                     // Gọi API với token admin
        .then(() => {
          showNotification("Tạo tài khoản thành công", "success");
        })
        .catch((err) => {
          showNotification(err.response.data.message, "error");
        });
    },
    
    // Validation schema với Yup
    validationSchema: yup.object({
      username: yup.string().required("Không được để trống"),
      password: yup.string().required("Không được để trống"),
      roleName: yup.string().required("Vui lòng chọn vai trò"),
    }),
  });

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* ===== FORM CARD ===== */}
      {/* Card container cho form tạo tài khoản */}
      <Card
        bordered
        title={
          <div className="flex items-center space-x-2">
            <UserAddOutlined className="text-blue-600 text-xl" />
            <Title level={4} className="!mb-0">
              Tạo Tài Khoản Mới
            </Title>
          </div>
        }
        className="shadow-lg border border-gray-200"
      >
        {/* ===== FORM LAYOUT ===== */}
        {/* Form 2 cột với các input fields và validation */}
        <form
          onSubmit={handleSubmit}                            // Submit handler
          className="grid grid-cols-2 gap-x-6 gap-y-4"      // Grid layout 2 cột
        >
          {/* ===== USERNAME INPUT ===== */}
          {/* Input tên đăng nhập với validation */}
          <InputCustom
            labelContent="Username"
            name="username"
            placeholder="Nhập tên đăng nhập"
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.username}
            touched={touched.username}
          />

          {/* ===== PASSWORD INPUT ===== */}
          {/* Input mật khẩu với type password */}
          <InputCustom
            labelContent="Password"
            name="password"
            typeInput="password"                             // Type password để ẩn text
            placeholder="Nhập mật khẩu"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            touched={touched.password}
          />

          {/* ===== ROLE SELECT ===== */}
          {/* Select dropdown cho vai trò - span 2 cột */}
          <div className="col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Vai trò
            </label>
            <Select
              placeholder="Chọn vai trò"
              value={values.roleName || undefined}          // Value từ Formik
              onChange={(value) => setFieldValue("roleName", value)}  // Update Formik value
              onBlur={handleBlur}
              className="w-full"
            >
              <Option value="admin">Admin</Option>           {/* Vai trò Admin */}
              <Option value="manager">Manager</Option>       {/* Vai trò Manager */}
              <Option value="doctor">Doctor</Option>         {/* Vai trò Doctor */}
            </Select>
            {/* Error message cho role select */}
            {errors.roleName && touched.roleName && (
              <p className="text-red-500 text-sm mt-1">{errors.roleName}</p>
            )}
          </div>

          {/* ===== SUBMIT BUTTON ===== */}
          {/* Nút submit centered và span 2 cột */}
          <div className="col-span-2 flex justify-center pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
            >
              Đăng ký
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default CreateAccount;
