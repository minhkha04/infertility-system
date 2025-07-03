import React from "react";
import { motion } from "framer-motion";
import babyImage from "../../public/images/babySleep-new.png";

const PulleyAnimation = ({ authMode, onSwitchMode }) => {
  const translateX = authMode === "login" ? "0%" : "-50%";

  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-100 via-orange-300 to-orange-500 animate-gradientShift">
      {/* Ảnh kéo trượt trái/phải */}
      <div
        className="absolute top-0 left-0 w-[200%] h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(${translateX})` }}
      >
        <motion.img
          src={babyImage}
          alt="Pulley Background"
          className="w-full h-full object-cover"
          animate={{
            scale: [1, 1.025, 1],
            x: [0, -3, 3, 0],
            y: [0, -2, 2, 0],
            rotate: [0, 0.3, -0.3, 0],
          }}
          transition={{
            duration: 3, // ← giảm từ 10 → 5 giây cho nhanh hơn
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </div>
      {(authMode === "login" || authMode === "register") && (
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center px-6 space-y-4">
          <div className="text-orange-800 text-lg md:text-xl font-semibold max-w-md leading-snug">
            {authMode === "login"
              ? "“Mỗi hành trình sinh con là một phép màu.\nChúng tôi đồng hành cùng bạn từ những bước đầu tiên.”"
              : "“Mỗi người mẹ, người cha đều xứng đáng có một hành trình khởi đầu đầy yêu thương. Hãy để chúng tôi đồng hành cùng bạn trong từng khoảnh khắc.”"}
          </div>

          <button
            onClick={onSwitchMode}
            className="bg-white/80 text-orange-600 hover:bg-orange-500 hover:text-white transition-colors px-4 py-2 rounded-full shadow-md text-sm font-semibold"
          >
            {authMode === "login" ? "Tạo tài khoản mới" : "Quay lại đăng nhập"}
          </button>
        </div>
      )}

      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradientShift {
            background-size: 200% 200%;
            animation: gradientShift 8s ease infinite;
          }
        `}
      </style>
    </div>
  );
};

export default PulleyAnimation;
