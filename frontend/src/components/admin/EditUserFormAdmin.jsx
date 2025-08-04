import { useContext } from "react";
import { NotificationContext } from "../../App";
import { useFormik } from "formik";
import { adminService } from "../../service/admin.service";
import InputCustom from "../Input/InputCustom";
import * as yup from "yup";

const EditUserFormAdmin = ({ 
  userDetail,    // Chi tiết user cần chỉnh sửa
  token,         // Token admin để xác thực
  onUpdated,     // Callback khi cập nhật thành công
  onClose        // Callback để đóng modal
}) => {
  // ===== CONTEXT =====
  const { showNotification } = useContext(NotificationContext);        // Context hiển thị thông báo

  // ===== FORMIK FORM MANAGEMENT =====
  // Setup Formik để quản lý form edit user với validation
  const { 
    handleSubmit,    // Handler submit form
    handleChange,    // Handler change input  
    handleBlur,      // Handler blur input
    values,          // Giá trị hiện tại của form
    errors,          // Lỗi validation
    touched          // Trường đã được touch
  } = useFormik({
    enableReinitialize: true,                                          // Cho phép reinitialize khi userDetail thay đổi
    
    // Initial values từ userDetail prop
    initialValues: {
      fullName: userDetail?.fullName || "",                           // Họ tên đầy đủ
      email: userDetail?.email || "",                                 // Email
      phoneNumber: userDetail?.phoneNumber || "",                     // Số điện thoại
      gender: userDetail?.gender || "",                               // Giới tính
      dateOfBirth: userDetail?.dateOfBirth || "",                     // Ngày sinh
      address: userDetail?.address || "",                             // Địa chỉ
    },
    
    // Submit handler - gọi API cập nhật user
    onSubmit: (values) => {
      adminService
        .updateUserById(userDetail.id, values, token)                 // Gọi API với user ID và token
        .then(() => {
          showNotification("Cập nhật thành công", "success");
          onUpdated?.();                                              // Trigger callback để refresh data
          onClose?.();                                                // Đóng modal
        })
        .catch((err) => {
          showNotification(err.response.data.message, "error");
        });
    },
    
    // Validation schema với Yup - tất cả field đều required
    validationSchema: yup.object({
      fullName: yup
        .string()
        .trim("Vui lòng không để ô trống")
        .required("Vui lòng nhập họ tên"),
      email: yup
        .string()
        .trim("Vui lòng không để ô trống")
        .required("Vui lòng nhập email"),
      phoneNumber: yup
        .string()
        .trim("Vui lòng không để ô trống")
        .required("Vui lòng nhập số điện thoại"),
      gender: yup
        .string()
        .trim("Vui lòng không để ô trống")
        .required("Vui lòng chọn giới tính"),
      dateOfBirth: yup
        .string()
        .trim("Vui lòng không để ô trống")
        .required("Vui lòng nhập ngày sinh"),
      address: yup
        .string()
        .trim("Vui lòng không để ô trống")
        .required("Vui lòng nhập địa chỉ"),
    }),
  });

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div>
      {/* ===== EDIT USER FORM ===== */}
      {/* Form 2 cột chỉnh sửa thông tin user */}
      <form
        id="edit-user-form"
        onSubmit={handleSubmit}                                       // Submit handler
        className="grid grid-cols-2 gap-6"                           // Grid layout 2 cột
      >
        {/* ===== READ-ONLY FIELDS ===== */}
        {/* Các field chỉ đọc không thể chỉnh sửa */}
        
        {/* ID field - readonly */}
        <InputCustom
          labelContent="ID"
          name="id"
          value={userDetail.id}
          onChange={() => {}}                                         // Empty handler vì readonly
          classWrapper="opacity-60 pointer-events-none"              // Style readonly
        />

        {/* Username field - readonly */}
        <InputCustom
          labelContent="Username"
          name="username"
          value={userDetail.username}
          onChange={() => {}}                                         // Empty handler vì readonly
          classWrapper="opacity-60 pointer-events-none"              // Style readonly
        />

        {/* ===== EDITABLE FIELDS ===== */}
        {/* Các field có thể chỉnh sửa với validation */}
        
        {/* Full Name field */}
        <InputCustom
          labelContent="Full Name"
          name="fullName"
          value={values.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.fullName}
          touched={touched.fullName}
        />

        {/* Email field */}
        <InputCustom
          labelContent="Email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          touched={touched.email}
        />

        {/* Phone Number field */}
        <InputCustom
          labelContent="Phone Number"
          name="phoneNumber"
          value={values.phoneNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.phoneNumber}
          touched={touched.phoneNumber}
        />

        {/* ===== GENDER SELECT DROPDOWN ===== */}
        {/* Gender select với 3 options: Male/Female/Other */}
        <div>
          <label
            htmlFor="gender"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={values.gender}
            onChange={handleChange}
            onBlur={handleBlur}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Select gender --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {/* Error message cho gender */}
          {errors.gender && touched.gender && (
            <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
          )}
        </div>

        {/* Date of Birth field - input type date */}
        <InputCustom
          labelContent="Date of Birth"
          name="dateOfBirth"
          typeInput="date"                                            // Date picker input
          value={values.dateOfBirth}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.dateOfBirth}
          touched={touched.dateOfBirth}
        />

        {/* Role field - readonly */}
        <InputCustom
          labelContent="Vai trò"
          name="role"
          value={userDetail.roleName?.name}                          // Hiển thị tên role
          onChange={() => {}}                                         // Empty handler vì readonly
          classWrapper="opacity-60 pointer-events-none"              // Style readonly
        />

        {/* Address field */}
        <InputCustom
          labelContent="Address"
          name="address"
          value={values.address}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.address}
          touched={touched.address}
        />
      </form>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default EditUserFormAdmin;
