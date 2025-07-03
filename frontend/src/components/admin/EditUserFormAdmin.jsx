import React, { useContext } from "react";
import { NotificationContext } from "../../App";
import { useFormik } from "formik";
import { adminService } from "../../service/admin.service";
import InputCustom from "../Input/InputCustom";
import * as yup from "yup";

const EditUserFormAdmin = ({ userDetail, token, onUpdated, onClose }) => {
  const { showNotification } = useContext(NotificationContext);
  const { handleSubmit, handleChange, handleBlur, values, errors, touched } =
    useFormik({
      enableReinitialize: true,
      initialValues: {
        fullName: userDetail?.fullName || "",
        email: userDetail?.email || "",
        phoneNumber: userDetail?.phoneNumber || "",
        gender: userDetail?.gender || "",
        dateOfBirth: userDetail?.dateOfBirth || "",
        address: userDetail?.address || "",
      },
      onSubmit: (values) => {
        adminService
          .updateUserById(userDetail.id, values, token)
          .then((res) => {
            showNotification("Cập nhật thành công", "success");
            onUpdated?.();
            onClose?.();
          })
          .catch((err) => {
            showNotification(err.response.data.message, "error");
          });
      },
      validationSchema: yup.object({
        fullName: yup
          .string()
          .trim("Please do not leave blank")
          .required("Full name is required"),
        email: yup
          .string()
          .trim("Please do not leave blank")
          .required("Email is required"),
        phoneNumber: yup
          .string()
          .trim("Please do not leave blank")
          .required("Phone is required"),
        gender: yup
          .string()
          .trim("Please do not leave blank")
          .required("Please choose your gender"),
        dateOfBirth: yup
          .string()
          .trim("Please do not leave blank")
          .required("Date of birth is required"),
        address: yup
          .string()
          .trim("Please do not leave blank")
          .required("Address is required"),
      }),
    });

  return (
    <div>
      <form
        id="edit-user-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-6"
      >
        <InputCustom
          labelContent="ID"
          name="id"
          value={userDetail.id}
          onChange={() => {}}
          classWrapper="opacity-60 pointer-events-none"
        />

        <InputCustom
          labelContent="Username"
          name="username"
          value={userDetail.username}
          onChange={() => {}}
          classWrapper="opacity-60 pointer-events-none"
        />
        <InputCustom
          labelContent="Full Name"
          name="fullName"
          value={values.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.fullName}
          touched={touched.fullName}
        />
        <InputCustom
          labelContent="Email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          touched={touched.email}
        />
        <InputCustom
          labelContent="Phone Number"
          name="phoneNumber"
          value={values.phoneNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.phoneNumber}
          touched={touched.phoneNumber}
        />

        {/* Gender (select) */}
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
          {errors.gender && touched.gender && (
            <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
          )}
        </div>
        <InputCustom
          labelContent="Date of Birth"
          name="dateOfBirth"
          typeInput="date"
          value={values.dateOfBirth}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.dateOfBirth}
          touched={touched.dateOfBirth}
        />
        <InputCustom
          labelContent="Vai trò"
          name="role"
          value={userDetail.roleName?.name}
          onChange={() => {}}
          classWrapper="opacity-60 pointer-events-none"
        />
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

export default EditUserFormAdmin;
