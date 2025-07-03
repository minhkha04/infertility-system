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
  const token = useSelector((state) => state.authSlice);
  const { showNotification } = useContext(NotificationContext);

  const {
    handleSubmit,
    handleChange,
    values,
    errors,
    touched,
    handleBlur,
    setFieldValue,
  } = useFormik({
    initialValues: {
      username: "",
      password: "",
      roleName: "",
    },
    onSubmit: (values) => {
      adminService
        .createUser(values, token.token)
        .then(() => {
          showNotification("Tạo tài khoản thành công", "success");
        })
        .catch((err) => {
          showNotification(err.response.data.message, "error");
        });
    },
    validationSchema: yup.object({
      username: yup.string().required("Không được để trống"),
      password: yup.string().required("Không được để trống"),
      roleName: yup.string().required("Vui lòng chọn vai trò"),
    }),
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
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
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-x-6 gap-y-4"
        >
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

          <InputCustom
            labelContent="Password"
            name="password"
            typeInput="password"
            placeholder="Nhập mật khẩu"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            touched={touched.password}
          />

          <div className="col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              Vai trò
            </label>
            <Select
              placeholder="Chọn vai trò"
              value={values.roleName || undefined}
              onChange={(value) => setFieldValue("roleName", value)}
              onBlur={handleBlur}
              className="w-full"
            >
              <Option value="admin">Admin</Option>
              <Option value="manager">Manager</Option>
              <Option value="doctor">Doctor</Option>
            </Select>
            {errors.roleName && touched.roleName && (
              <p className="text-red-500 text-sm mt-1">{errors.roleName}</p>
            )}
          </div>

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

export default CreateAccount;
