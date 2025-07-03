import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NotificationContext } from "../App";

const VnpayReturnPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = React.useContext(NotificationContext);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const responseCode = query.get("vnp_ResponseCode");
    const orderId = query.get("vnp_TxnRef");

    if (responseCode === "00") {
      showNotification("Thanh toán VNPAY thành công", "success");
    } else if (responseCode === "24") {
      showNotification("Bạn đã huỷ thanh toán VNPAY", "warning");
    } else {
      showNotification("Thanh toán VNPAY thất bại", "error");
    }

    setTimeout(() => {
      navigate("/customer-dashboard/payment");
    }, 3000);
  }, []);

  return (
    <div className="text-center p-10">
      <h2 className="text-xl font-bold mb-2">
        🔁 Đang xử lý kết quả thanh toán...
      </h2>
      <p>Bạn sẽ được chuyển về danh sách dịch vụ trong giây lát.</p>
    </div>
  );
};

export default VnpayReturnPage;
