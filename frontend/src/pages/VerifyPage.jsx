import { useFormik } from "formik";
import React, { useContext } from "react";
import { useSelector } from "react-redux";
import * as yup from "yup";
import InputCustom from "../components/Input/InputCustom";
import { authService } from "../service/auth.service";
import { NotificationContext } from "../App";
import { useNavigate } from "react-router-dom";

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
            showNotification("OTP xác nhận thành công", "success");
            setTimeout(() => {
              navigate("/dang-nhap");
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

  const resendOtp = async () => {
    if (!infoUser) {
      return;
    }
    try {
      const res = await authService.resendOtp(infoUser.email);
      showNotification("Đã gửi lại mã đến Email của bạn", "success");
      console.log(res);
    } catch (error) {
      console.log(error);
      showNotification(error.response.data.message, "error");
    }
  };

  return (
    <div>
      <div className="max-w-md mx-auto mt-20 p-8 border rounded-lg shadow-sm bg-white">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Xác nhận tài khoản của bạn
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Vui lòng nhập mã code OTP chungs tôi đã gửi <br />
          <span className="font-medium text-gray-900">{infoUser.email}</span> để
          kích hoạt tài khoản này.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <InputCustom
            labelContent="Mã code xác nhận"
            id="otp"
            name="otp"
            placeholder="Nhập mã code OTP"
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
            Xác nhận code
          </button>

          <button
            className="text-center text-sm mt-4 text-blue-500 cursor-pointer hover:underline"
            onClick={resendOtp}
          >
            Gửi lại code
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyPage;
