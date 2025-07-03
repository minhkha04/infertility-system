import { useFormik } from "formik";
import React, { useContext } from "react";
import InputCustom from "../components/Input/InputCustom";
import { authService } from "../service/auth.service";
import { NotificationContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { path } from "../common/path";
import { useDispatch } from "react-redux";
import { setLocalStorage } from "../utils/util";
import { getInfoUser } from "../redux/authSlice";

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { showNotification } = useContext(NotificationContext);

  const { handleSubmit, handleChange, values, errors, touched, handleBlur } =
    useFormik({
      initialValues: {
        username: "",
        password: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        gender: "",
        dateOfBirth: "",
        address: "",
      },
      onSubmit: (values) => {
        authService
          .signUp(values)
          .then((res) => {
            //thực hiện lưu trự dưới localStorage
            setLocalStorage("user", res.data.result);
            dispatch(getInfoUser(res.data.result));

            showNotification("Register successful", "success");
            setTimeout(() => {
              navigate("/verify-otp");
              window.location.reload();
            }, 1000);
          })
          .catch((errors) => {
            showNotification(errors.response.data.message, "error");
          });
      },
      validationSchema: yup.object({
        username: yup
          .string()
          .trim("Vui lòng không để trống hoặc khoảng trắng")
          .required("Vui lòng không để trống hoặc khoảng trắng"),
        password: yup
          .string()
          .trim("Vui lòng không để trống hoặc khoảng trắng")
          .required("Vui lòng không để trống hoặc khoảng trắng"),
        fullName: yup
          .string()
          .trim("Vui lòng không để trống hoặc khoảng trắng")
          .required("Tên đầy đủ là bắt buộc"),
        email: yup
          .string()
          .trim("Vui lòng không để trống hoặc khoảng trắng")
          .email("Không đúng định dạng email")
          .required("Email Là bắt buộc"),
        phoneNumber: yup
          .string()
          .trim("Vui lòng không để trống hoặc khoảng trắng")
          .required("Số điện thoại là bắt buộc"),
        gender: yup
          .string()
          .trim("Vui lòng không để trống hoặc khoảng trắng")
          .required("Vui lòng chọn giới tính"),
        dateOfBirth: yup.date().required("Ngày sinh là bắt buộc"),
        address: yup
          .string()
          .trim("Vui lòng không để trống hoặc khoảng trắng")
          .required("Địa chỉ là bắt buộc"),
      }),
    });

  return (
    <div>
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded px-10 py-8 mt-10">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Đăng kí tài khoản
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* LEFT COLUMN */}
            <InputCustom
              labelContent="Tài khoản"
              id="username"
              name="username"
              placeholder="Nhập tài khoản"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.username}
              touched={touched.username}
            />

            <InputCustom
              labelContent="Mật khẩu"
              id="password"
              name="password"
              placeholder="Nhập mật khẩu"
              typeInput="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              touched={touched.password}
            />

            <InputCustom
              labelContent="Tên đầy đủ"
              id="fullName"
              name="fullName"
              placeholder="Nhập tên đầy đủ"
              value={values.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.fullName}
              touched={touched.fullName}
            />

            <InputCustom
              labelContent="Email"
              id="email"
              name="email"
              placeholder="Nhập email"
              typeInput="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              touched={touched.email}
            />

            <InputCustom
              labelContent="Số điện thoại"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="Nhập số điện thoại"
              value={values.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phoneNumber}
              touched={touched.phoneNumber}
            />

            <InputCustom
              labelContent="Địa chỉ"
              id="address"
              name="address"
              placeholder="Nhập địa chỉ của bạn"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.address}
              touched={touched.address}
            />

            {/* Gender (select) */}
            <div>
              <label
                htmlFor="gender"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Giới tính
              </label>
              <select
                id="gender"
                name="gender"
                value={values.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
              {errors.gender && touched.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
              )}
            </div>

            <InputCustom
              labelContent="Ngày sinh"
              id="dateOfBirth"
              name="dateOfBirth"
              typeInput="date"
              value={values.dateOfBirth}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.dateOfBirth}
              touched={touched.dateOfBirth}
            />
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition duration-200"
            >
              Đăng kí
            </button>{" "}
            <Link
              to={path.signIn}
              className="mt-3 text-blue-600 hover:underline duration-300"
            >
              Đã có tài khoản, nhấp vào đây
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
