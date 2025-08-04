// src/components/GoogleLogin.jsx
import { useContext, useEffect } from "react";
import { authService } from "../service/auth.service";
import { setLocalStorage } from "../utils/util";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../App";
import { useDispatch } from "react-redux";
import { setToken } from "../redux/authSlice";

export default function GoogleLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      /* global google */
      window.google.accounts.id.initialize({
        client_id:
          "275410243519-d80fcmlrq078l24q9hechprhjraon6e5.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "outline",
          size: "large",
          text: "sign_in_with",
          shape: "rectangular",
          logo_alignment: "left",
        }
      );
    };

    document.body.appendChild(script);
  }, []);

  const handleCredentialResponse = async (response) => {
    const idToken = response.credential;
    console.log(idToken);
    try {
      const res = await authService.signInByGoogle(idToken, "GOOGLE");
      const data = res.data.result;

      if (data.token) {
        setLocalStorage("token", res.data.result.token); // coi lai phia be tra du lieu theo format nao.
        dispatch(setToken(res.data.result.token));

        showNotification("Đăng nhập thành công", "success");
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      showNotification(error.response.data.message, "error");
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center items-center py-2">
      <div className="w-full max-w mx-auto" id="google-signin-button"></div>
    </div>
  );
}
