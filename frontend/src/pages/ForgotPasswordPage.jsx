import React, { useContext } from "react";
import { useLottie } from "lottie-react";
import InputCustom from "../components/Input/InputCustom";
import { Link, useNavigate } from "react-router-dom";
import { path } from "../common/path";
import { useFormik } from "formik";
import * as yup from "yup";
import { authService } from "../service/auth.service";
import { NotificationContext } from "../App";
import signInAnimation from "./../assets/animation/signIn_Animation.json";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);

  const options = {
    animationData: signInAnimation,
    loop: true,
  };

  const { View } = useLottie(options);

  const { handleSubmit, handleChange, values, errors, touched, handleBlur, isSubmitting } =
    useFormik({
      initialValues: {
        email: "",
      },
      onSubmit: async (values, { setSubmitting }) => {
        try {
          const response = await authService.forgotPassword(values);
          showNotification("OTP đã được gửi đến email của bạn!", "success");
          setTimeout(() => {
            navigate(path.resetPassword, { 
              state: { email: values.email } 
            });
          }, 1500);
        } catch (error) {
          console.log("Forgot password error:", error);
          showNotification(
            error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!", 
            "error"
          );
        } finally {
          setSubmitting(false);
        }
      },
      validationSchema: yup.object({
        email: yup
          .string()
          .email("Email không hợp lệ")
          .required("Vui lòng nhập email"),
      }),
    });

  return (
    <div className="">
      <div className="container">
        <div className="loginPage_content flex items-center h-screen">
          <div className="loginPage_img w-1/2">{View}</div>
          <div className="loginPage_form w-1/2">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <h1 className="text-center text-4xl font-medium">QUÊN MẬT KHẨU</h1>
              <p className="text-center text-gray-600 mb-6">
                Nhập email của bạn để nhận mã xác thực
              </p>
              
              {/* Email */}
              <InputCustom
                name={"email"}
                onChange={handleChange}
                value={values.email}
                placeholder={"Vui lòng nhập email"}
                labelContent={"Email"}
                error={errors.email}
                touched={touched.email}
                onBlur={handleBlur}
                typeInput="email"
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
                  {isSubmitting ? "Đang gửi..." : "Gửi mã xác thực"}
                </button>
                
                <div className="mt-4 text-center">
                  <Link
                    to={path.signIn}
                    className="text-blue-600 hover:underline duration-300"
                  >
                    ← Quay lại đăng nhập
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 