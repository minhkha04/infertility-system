import { useFormik } from "formik";
import React, { useContext } from "react";
import { useSelector } from "react-redux";
import * as yup from "yup";
import InputCustom from "../components/Input/InputCustom";
import { authService } from "../service/auth.service";
import { NotificationContext } from "../App";
import { useNavigate } from "react-router-dom";
import { path } from "framer-motion/client";

const VerifyPage = () => {
  const navigate = useNavigate();
  const { infoUser } = useSelector((state) => state.authSlice);
  const { showNotification } = useContext(NotificationContext);

  const { handleSubmit, handleChange, values, errors, touched, handleBlur } =
    useFormik({
      initialValues: {
        otp: "",
        email: infoUser.email,
      },
      onSubmit: (values) => {
        authService
          .verify(values)
          .then((res) => {
            showNotification("OTP kiểm tra thành công", "success");
            setTimeout(() => {
              navigate(path.testLogin);
              localStorage.clear();
              window.location.reload();
            }, 1000);
          })
          .catch((errors) => {
            showNotification(errors.response.data.message, "error");
          });
      },
      validationSchema: yup.object({
        otp: yup.string().required("Vui lòng không để trống"),
      }),
    });

  return (
    <div>
      <div className="max-w-md mx-auto mt-20 p-8 border rounded-lg shadow-sm bg-white">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Xác nhận tài khoản của bạn
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Vui lòng nhập mã xác nhận mà chúng tôi đã gửi đến <br />
          <span className="font-medium text-gray-900">{infoUser.email}</span> để
          kích hoạt tài khoản của bạn.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <InputCustom
            labelContent="Mã xác nhận của bạn"
            id="otp"
            name="otp"
            placeholder="Nhập mã OTP"
            typeInput="text"
            value={values.otp}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.otp}
            touched={touched.otp}
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Xác nhận mã
          </button>

          <button
            type="button"
            onClick={async () => {
              await authService.resendOtp({ email: infoUser.email });
              showNotification("Đã gửi otp đến email của bạn", "success");
            }}
            className="text-sm mt-2 text-blue-500 hover:underline"
          >
            Gửi lại mã OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyPage;
