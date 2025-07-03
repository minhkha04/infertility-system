import { useContext } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../App";
import { useFormik } from "formik";
import * as yup from "yup";
import { getInfoUser } from "../redux/authSlice";
import { setLocalStorage } from "../utils/util";
import { path } from "../common/path";
import { authService } from "../service/auth.service";
import InputCustom from "../components/Input/InputCustom";

const RegisterForm = ({ switchToLogin }) => {
  // Copy toàn bộ useFormik từ RegisterPage
  const { showNotification } = useContext(NotificationContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
            console.log(errors);
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
    <div className="bg-white w-full h-full px-8 py-10 text-gray-800 overflow-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Đăng ký</h2>
      {/* Form đăng ký đầy đủ y hệt RegisterPage */}
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
            className="w-full py-2 bg-orange-600 hover:brightness-110 hover:scale-[1.02] transition-all duration-200 ease-in-out rounded-md text-white font-semibold"
          >
            Đăng kí
          </button>{" "}
        </div>
      </form>
      <p className="text-sm mt-6 text-center">
        Đã có tài khoản?{" "}
        <button onClick={switchToLogin} className="text-orange-600 underline">
          Đăng nhập
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;
