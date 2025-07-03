import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import PulleyAnimation from "./PulleyAnimation";
import { useSearchParams } from "react-router-dom";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const modeFromUrl = searchParams.get("mode"); // lấy giá trị mode từ URL

  const [authMode, setAuthMode] = useState(
    modeFromUrl === "register" ? "register" : "login"
  ); // điều khiển animation
  const [formZ, setFormZ] = useState("login"); // điều khiển z-index độc lập
  const [isReady, setIsReady] = useState(false); // để delay render animation

  useEffect(() => {
    const mode = modeFromUrl === "register" ? "register" : "login";
    setAuthMode(mode);
    setFormZ(mode); // để không bị delay lúc đầu
    setIsReady(true); // đánh dấu đã khởi tạo xong
  }, [modeFromUrl]);

  useEffect(() => {
    // chỉ delay z-index khi isReady
    if (!isReady) return;
    const timer = setTimeout(() => setFormZ(authMode), 400);
    return () => clearTimeout(timer);
  }, [authMode, isReady]);

  return (
    <div className="min-h-screen bg-orange-100 flex items-center justify-center px-4">
      <div className="relative w-full max-w-6xl h-[640px] rounded-xl overflow-hidden shadow-2xl bg-white">
        {isReady && (
          <>
            {/* PulleyAnimation luôn trên cùng */}

            <motion.div
              initial={false} // ngăn hiệu ứng Framer Motion tự animate khi mount
              animate={{ x: authMode === "login" ? "0%" : "100%" }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-1/2 h-full z-40"
            >
              <PulleyAnimation
                authMode={authMode}
                onSwitchMode={() =>
                  setAuthMode(authMode === "login" ? "register" : "login")
                }
              />
            </motion.div>

            {/* LoginForm - trượt trái */}
            <motion.div
              initial={false}
              animate={{ x: authMode === "login" ? "0%" : "-100%" }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className={`absolute top-0 left-1/2 w-1/2 h-full p-8 ${
                formZ === "login"
                  ? "z-30 pointer-events-auto"
                  : "z-20 pointer-events-none"
              }`}
            >
              <LoginForm switchToRegister={() => setAuthMode("register")} />
            </motion.div>

            {/* RegisterForm - trượt vào */}
            <motion.div
              initial={false}
              animate={{ x: authMode === "register" ? "0%" : "100%" }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className={`absolute top-0 left-0 w-1/2 h-full p-8 ${
                formZ === "register"
                  ? "z-30 pointer-events-auto"
                  : "z-20 pointer-events-none"
              }`}
            >
              <RegisterForm switchToLogin={() => setAuthMode("login")} />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
