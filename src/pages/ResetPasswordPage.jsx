import React, { useContext, useEffect, useState } from "react";
import { useLottie } from "lottie-react";
import InputCustom from "../components/Input/InputCustom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { path } from "../common/path";
import { useFormik } from "formik";
import * as yup from "yup";
import { authService } from "../service/auth.service";
import { NotificationContext } from "../App";
import signInAnimation from "./../assets/animation/signIn_Animation.json";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useContext(NotificationContext);
  const [email, setEmail] = useState("");

  const options = {
    animationData: signInAnimation,
    loop: true,
  };
  const { View } = useLottie(options);
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      showNotification("Vui lòng nhập email trước!", "warning");
      navigate(path.forgotPassword);
    }
  }, [location.state, navigate, showNotification]);

  const {
    handleSubmit,
    handleChange,
    values,
    errors,
    touched,
    handleBlur,
    isSubmitting,
  } = useFormik({
    initialValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log("Sending reset password request:", {
          email,
          otp: values.otp,
          password: values.password,
        });
        const resetData = {
          email: email,
          otp: values.otp,
          password: values.password,
        };
        const response = await authService.resetPassword(resetData);
        showNotification("Đặt lại mật khẩu thành công!", "success");
        setTimeout(() => {
          navigate(path.testLogin, {
            state: {
              username: email, // Sử dụng email đầy đủ thay vì chỉ phần username
              message:
                "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới.",
            },
          });
        }, 1500);
      } catch (error) {
        console.log("Reset password error:", error);
        showNotification(
          error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!",
          "error"
        );
      } finally {
        setSubmitting(false);
      }
    },
    validationSchema: yup.object({
      otp: yup
        .string()
        .required("Vui lòng nhập mã OTP")
        .length(6, "Mã OTP phải có 6 số"),
      password: yup
        .string()
        .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
        .max(20, "Mật khẩu không được quá 20 ký tự")
        .required("Vui lòng nhập mật khẩu mới"),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password"), null], "Mật khẩu xác nhận không khớp")
        .required("Vui lòng xác nhận mật khẩu"),
    }),
  });

  const handleResendOTP = async () => {
    try {
      const response = await authService.forgotPassword({ email });
      showNotification("Mã OTP mới đã được gửi!", "success");
    } catch (error) {
      showNotification("Không thể gửi lại mã OTP, vui lòng thử lại!", "error");
    }
  };

  if (!email) {
    return null; // Sẽ redirect về forgot password
  }

  return (
    <div className="">
      <div className="container">
        <div className="loginPage_content flex items-center h-screen">
          <div className="loginPage_img w-1/2">{View}</div>
          <div className="loginPage_form w-1/2">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <h1 className="text-center text-4xl font-medium">
                ĐẶT LẠI MẬT KHẨU
              </h1>
              <p className="text-center text-gray-600 mb-6">
                Mã OTP đã được gửi đến:{" "}
                <span className="font-semibold">{email}</span>
              </p>

              {/* OTP */}
              <InputCustom
                name={"otp"}
                onChange={handleChange}
                value={values.otp}
                placeholder={"Nhập mã OTP 6 số"}
                labelContent={"Mã OTP"}
                error={errors.otp}
                touched={touched.otp}
                onBlur={handleBlur}
                typeInput="text"
                maxLength={6}
              />

              {/* New Password */}
              <InputCustom
                name={"password"}
                onChange={handleChange}
                value={values.password}
                placeholder={"Nhập mật khẩu mới"}
                labelContent={"Mật khẩu mới"}
                error={errors.password}
                touched={touched.password}
                onBlur={handleBlur}
                typeInput="password"
              />

              {/* Confirm Password */}
              <InputCustom
                name={"confirmPassword"}
                onChange={handleChange}
                value={values.confirmPassword}
                placeholder={"Xác nhận mật khẩu mới"}
                labelContent={"Xác nhận mật khẩu"}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
                onBlur={handleBlur}
                typeInput="password"
              />

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-block w-full py-2 px-5 rounded-md text-white ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#ff8460] hover:bg-[#ff6b40]"
                  } transition duration-300`}
                >
                  {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </button>

                <div className="mt-4 text-center space-y-2">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-[#ff8460] hover:underline duration-300"
                  >
                    Gửi lại mã OTP
                  </button>

                  <div>
                    <Link
                      to={path.forgotPassword}
                      className="text-blue-600 hover:underline duration-300"
                    >
                      ← Quay lại nhập email
                    </Link>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
