import React, { useContext, useState } from "react";
import signInAnimation from "./../assets/animation/Animation - 1744810564155.json";
import { useLottie } from "lottie-react";
import InputCustom from "../components/Input/InputCustom";
import { Link, useNavigate } from "react-router-dom";
import { path } from "../common/path";
import { useFormik } from "formik";
import * as yup from "yup";
import { authService } from "../service/auth.service";
import { getLocgetlStorage, setLocalStorage } from "../utils/util";
import GoogleLogin from "../components/GoogleLogin";
import { NotificationContext } from "../App";
import { useDispatch } from "react-redux";
import { setToken } from "../redux/authSlice";
import PulleyAnimation from "./PulleyAnimation";
const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useContext(NotificationContext);

  const options = {
    animationData: signInAnimation,
    loop: true,
  };

  const { View } = useLottie(options);

  const [isResend, setIsResend] = useState();

  const { handleSubmit, handleChange, values, errors, touched, handleBlur } =
    useFormik({
      initialValues: {
        username: "",
        password: "",
      },
      onSubmit: (values) => {
        // gọi hàm sử lí bên authService
        authService
          .signIn(values)
          .then((res) => {
            console.log(res);
            //thực hiện lưu trự dưới localStorage
            setLocalStorage("token", res.data.result.token);
            dispatch(setToken(res.data.result.token));

            // thực hiên thông báo chuyển hướng người dùng
            showNotification("Đăng nhập thành công", "success");
            localStorage.setItem("loginJustNow", "true");
            // Kiểm tra xem có URL redirect không
            const redirectUrl = localStorage.getItem("redirectAfterLogin");
            if (redirectUrl) {
              localStorage.removeItem("redirectAfterLogin"); // Xóa URL redirect
              setTimeout(() => {
                navigate(redirectUrl);
              }, 1000);
            } else {
              setTimeout(() => {
                navigate("/");
              }, 1000);
            }
          })
          .catch((error) => {
            if (error.response.data.code == 1014) {
              setIsResend(true);
              showNotification(
                "Nếu bạn muốn xác nhận otp lại, hãy nhấn vào đây",
                "warning"
              );
            } else {
              showNotification(error.response.data.message, "error");
            } // coi lai respone tu be tra ve
          });
      },
      validationSchema: yup.object({
        username: yup
          .string()
          .trim("Vui lòng không để trống tài khoản")
          .required("Vui lòng không để trống tài khoản"),
        password: yup
          .string()
          .trim("Vui lòng không để trống mật khẩu")
          .required("Vui lòng không để trống mật khẩu"),
      }),
    });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-orange-100 relative overflow-hidden">
      {/* Container */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-orange-50 text-gray-800 rounded-xl overflow-hidden shadow-xl z-10">
        {/* Left animation */}
        <div className="hidden md:block md:w-1/2">
          <PulleyAnimation />
        </div>

        {/* Right form */}
        <div className="w-full md:w-1/2 px-8 py-12 text-gray-800 flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center mb-2 ring-2 ring-orange-400 shadow-lg">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <img
                  src="https://res.cloudinary.com/di6hi1r0g/image/upload/v1748665959/icon_pch2gc.png"
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Chào mừng đến đây</h2>
            <p className="text-sm text-gray-500">
              Vui lòng đăng nhập để tiếp tục
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500">
                <i className="fas fa-user" />
              </span>
              <InputCustom
                name="username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.username}
                error={errors.username}
                placeholder="Tài khoản"
                labelContent={null}
                className="pl-10 bg-white/90 text-black"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500">
                <i className="fas fa-lock" />
              </span>
              <InputCustom
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.password}
                error={errors.password}
                placeholder="Mật khẩu"
                typeInput="password"
                labelContent={null}
                className="pl-10 bg-white/90 text-black"
              />
            </div>

            <div className="text-right text-sm">
              <Link
                to={path.forgotPassword}
                className="text-orange-500 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-orange-600 hover:brightness-110 hover:scale-[1.02] transition-all duration-200 ease-in-out rounded-md text-white font-semibold"
            >
              Đăng nhập
            </button>
          </form>

          <div className="my-5 text-sm flex items-center gap-4">
            <hr className="flex-grow border-white/30" />
            <span className="text-white/70">Hoặc</span>
            <hr className="flex-grow border-white/30" />
          </div>

          <GoogleLogin />

          <div className="text-center text-sm mt-6">
            Chưa có tài khoản?{" "}
            <Link to={path.signUp} className="text-orange-300 hover:underline">
              Đăng ký ngay
            </Link>
          </div>

          {isResend && (
            <div className="mt-4 text-yellow-300 text-center text-sm">
              Nếu bạn muốn xác nhận OTP lại, hãy nhấn vào đây.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
