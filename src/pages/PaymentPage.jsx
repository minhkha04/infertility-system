import React, { useContext, useEffect, useRef, useState } from "react";
import { customerService } from "../service/customer.service";
import { treatmentService } from "../service/treatment.service";
import { authService } from "../service/auth.service";
import { NotificationContext } from "../App";

const PaymentPage = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [infoUser, setInfoUser] = useState();
  const [paymentList, setPaymentList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const { showNotification } = useContext(NotificationContext);
  const intervalRef = useRef(null);
  const [countdown, setCountdown] = useState();
  const countdownIntervalRef = useRef(null);
  const [reloadCooldown, setReloadCooldown] = useState(0);
  useEffect(() => {
    authService
      .getMyInfo()
      .then((res) => {
        setInfoUser(res.data.result);
      })
      .catch((err) => {});
  }, []);

  // hien thi danh sach record cua customer
  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        const res = await customerService.getPaymentInfo();
        setPaymentList(res.data.result.content);
        console.log(res);
      } catch (err) {
        console.error("Lỗi lấy danh sách thanh toán:", err);
      }
    };

    fetchPaymentInfo();
  }, []);

  // hien thi thong bao khi thanh toan momo
  useEffect(() => {
    if (showModal && selectedTreatment?.recordId) {
      intervalRef.current = setInterval(() => {
        customerService
          .paymentNotificationForCustomer(selectedTreatment.recordId)
          .then((res) => {
            const { code, result } = res.data;

            if (code === 1000 && result === true) {
              showNotification("Đã thanh toán thành công", "success");
              setShowModal(false);
              sessionStorage.clear();
              fetchPaymentInfo();
              setQrCodeUrl("");
              setSelectedTreatment(null);
              clearInterval(intervalRef.current);
            }
            console.log(res.data);
          })
          .catch((err) => {
            console.error("Lỗi khi kiểm tra trạng thái thanh toán:", err);
          });
      }, 3000); // mỗi 3 giây
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }; // dọn dẹp nếu modal đóng
  }, [showModal, selectedTreatment]);

  // ham thanh toan momo
  const handleMomoPayment = async (recordId, treatment) => {
    try {
      const res = await customerService.paymentForCustomer(recordId);
      setQrCodeUrl(res.data.result); // dùng để hiển thị QR Code
      setSelectedTreatment(treatment);
      setShowModal(true);
      setCountdown(300); // set thoi gian 5p cho coutdow reload momo
      setReloadCooldown(30);
      // ✅ Lưu vào session
      sessionStorage.setItem(
        "momo_payment",
        JSON.stringify({
          qrCodeUrl: res.data.result,
          treatment,
          countdown: 300,
          reloadCooldown: 60,
        })
      );
    } catch (error) {
      console.log("Tạo thanh toán thất bại:", error);
      showNotification(error.response.data.message, "error");
    }
  };

  // ham thanh toan vnpay
  const handleVnpayPayment = async (recordId) => {
    try {
      const res = await customerService.paymentVnpayForCustomer(recordId);
      const paymentUrl = res.data.result;
      if (paymentUrl) {
        window.location.href = paymentUrl; // chuyển hướng sang trang VNPAY
      } else {
        showNotification("Không lấy được link thanh toán VNPAY", "error");
      }
    } catch (error) {
      console.error("VNPAY error:", error);
      showNotification("Thanh toán VNPAY thất bại", "error");
    }
  };

  // ham cancel khi thanh toan momo
  const handleMoMoCancel = async (recordId) => {
    try {
      const res = await customerService.paymentCancelForCustomer(recordId);
      showNotification("Đã hủy thanh toán", "warning");
    } catch (error) {
      console.log(error);
    }
  };

  const handleMoMoReload = async (recordId, treatment) => {
    try {
      const res = await customerService.paymentReloadForCustomer(recordId);
      setQrCodeUrl(res.data.result); // dùng để hiển thị QR Code
      setSelectedTreatment(treatment);
      setCountdown(300); // set thoi gian 5p cho coutdow reload momo
      setReloadCooldown(30); // set thời gian cho nút reload mã thanh toán momo
      showNotification("Lấy mã thanh toán mới thành công", "success");
    } catch (error) {
      console.log("Tạo thanh toán thất bại:", error);
    }
  };

  const handleCloseModal = () => {
    if (selectedTreatment?.recordId) {
      handleMoMoCancel(selectedTreatment.recordId);
    }
    setShowModal(false);
    setQrCodeUrl("");
    setSelectedTreatment(null);
    sessionStorage.removeItem("momo_payment"); // ✅ xóa session
  };
  // hàm xử lí count dow cho thanh toán momo
  useEffect(() => {
    if (showModal && selectedTreatment?.recordId) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          const next = prev - 1;

          if (next <= 0) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;

            // ✅ Check: chỉ reload khi cooldown đã xong
            if (reloadCooldown <= 0) {
              handleMoMoReload(selectedTreatment.recordId, selectedTreatment);
              setReloadCooldown(30); // Reset cooldown luôn ở đây
            }

            return 300; // reset sau reload
          }

          return next;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [showModal, selectedTreatment]);
  // hàm xử lí đếm ngược cho nút reload (60s)
  useEffect(() => {
    if (reloadCooldown > 0) {
      const cooldownInterval = setInterval(() => {
        setReloadCooldown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(cooldownInterval);
    }
  }, [reloadCooldown]);
  // hàm xử lí dữ liệu khi đang thanh toán sẽ được lưu vào session để bảo quản không bị mất dữ liệu khi f5
  useEffect(() => {
    const saved = sessionStorage.getItem("momo_payment");
    if (saved) {
      const { qrCodeUrl, treatment, countdown, reloadCooldown } =
        JSON.parse(saved);
      setQrCodeUrl(qrCodeUrl);
      setSelectedTreatment(treatment);
      setShowModal(true);
      setCountdown(countdown);
      setReloadCooldown(reloadCooldown);
    }
  }, []);

  // hàm map tiếng việt của status record
  const mapRecordStatusToVN = (status) => {
    switch (status) {
      case "CANCELLED":
        return "Đã hủy";
      case "INPROGRESS":
        return "Đang điều trị";
      case "COMPLETED":
        return "Hoàn tất điều trị";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4"> Danh sách dịch vụ của bạn</h2>

      {paymentList.length === 0 ? (
        <p className="text-gray-600">Không có dịch vụ nào.</p>
      ) : (
        <div className="space-y-4">
          {paymentList.map((payment) => (
            <div
              key={payment.recordId}
              className="bg-white shadow-sm border rounded-lg p-4 flex flex-col md:flex-row md:justify-between items-start md:items-center"
            >
              <div className="text-sm space-y-1">
                <p>
                  <strong className="text-gray-700">Dịch vụ:</strong>{" "}
                  {payment.treatmentServiceName}
                </p>
                <p>
                  <strong className="text-gray-700">Bác sĩ:</strong>{" "}
                  {payment.doctorName}
                </p>
                <p>
                  <strong className="text-gray-700">Số tiền</strong>{" "}
                  {payment.price}
                </p>
                <p>
                  <strong className="text-gray-700">Trạng thái:</strong>{" "}
                  {payment.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                </p>
                <p>
                  <strong className="text-gray-700">
                    Trạng thái điều trị:
                  </strong>{" "}
                  {mapRecordStatusToVN(payment.recordStatus)}
                </p>
              </div>

              {payment.isPaid ? (
                <button
                  disabled
                  className="bg-green-500 text-white py-3 px-2 rounded"
                >
                  Đã Thanh Toán
                </button>
              ) : payment.recordStatus !== "CANCELLED" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMomoPayment(payment.recordId, payment)}
                    className="bg-pink-600 text-white font-semibold py-2 px-4 rounded hover:bg-pink-700 transition"
                  >
                    Thanh toán MoMo
                  </button>
                  <button
                    onClick={() => handleVnpayPayment(payment.recordId)}
                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition"
                  >
                    Thanh toán VNPAY
                  </button>
                </div>
              ) : (
                <button
                  disabled
                  className="bg-gray-400 text-white py-3 px-2 rounded"
                >
                  Đã hủy - Không thể thanh toán
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedTreatment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal(); // ✅ Gọi cancel luôn khi click ngoài
            }
          }}
        >
          <div
            className="bg-white p-6 rounded-xl shadow-xl w-[340px] max-w-[90%] text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">
              Quét mã MoMo để thanh toán
            </h3>
            <p className="text-sm text-gray-600 mt-3">
              Mã QR sẽ hết hạn sau:{" "}
              <strong>
                {Math.floor(countdown / 60)}:
                {(countdown % 60).toString().padStart(2, "0")}
              </strong>
            </p>

            <p className="text-sm mb-1">
              <strong>{infoUser?.fullName}</strong>
            </p>
            <p className="text-sm mb-4">
              {selectedTreatment.treatmentServiceName}
            </p>

            <div className="inline-block  border-4 border-pink-500 rounded-lg p-2 bg-white">
              <img
                src={qrCodeUrl}
                alt="QR MoMo"
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="mt-5 flex justify-between">
              <button
                onClick={() =>
                  handleMoMoReload(
                    selectedTreatment.recordId,
                    selectedTreatment
                  )
                }
                disabled={reloadCooldown > 0}
                className={`px-4 py-2 rounded text-white transition ${
                  reloadCooldown > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {reloadCooldown > 0
                  ? `Tải lại mã QR (${reloadCooldown}s)`
                  : "Tải lại mã QR"}
              </button>
              <button
                onClick={handleCloseModal}
                className="5 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
