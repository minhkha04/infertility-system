import React from "react";

const UserFooter = () => {
  const openingHours = [
    { day: "Thứ 2", morning: "8h – 12h", afternoon: "13h – 17h" },
    { day: "Thứ 3", morning: "8h – 12h", afternoon: "13h – 17h" },
    { day: "Thứ 4", morning: "8h – 12h", afternoon: "13h – 17h" },
    { day: "Thứ 5", morning: "8h – 12h", afternoon: "13h – 17h" },
    { day: "Thứ 6", morning: "8h – 12h", afternoon: "13h – 17h" },
    { day: "Thứ 7", morning: "8h – 12h", afternoon: "13h – 17h" },
    { day: "Chủ nhật", morning: "8h – 12h", afternoon: "13h – 17h" },
  ];

  return (
    <footer className="bg-orange-50 pt-12 pb-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 items-start">
          {/* Logo & Description */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="rounded-full flex items-center justify-center w-16 h-16 overflow-hidden border-2"
                style={{ borderColor: "#FF8460" }}
              >
                <img
                  src="https://res.cloudinary.com/di6hi1r0g/image/upload/v1748665959/icon_pch2gc.png"
                  alt="Logo Bệnh viện Sinh sản NewLife"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
                  NewLife
                </div>
                <div className="text-gray-600 text-sm font-medium">
                  Bệnh viện Sinh sản
                </div>
              </div>
            </div>
            <div className="text-gray-500 text-sm mt-3 pr-4">
              Chúng tôi là một trung tâm sinh sản hoàn toàn mới. Chúng tôi cung
              cấp cho khách hàng công nghệ sinh sản tiên tiến nhất và sự thoải
              mái. Mục tiêu của chúng tôi là giúp khách hàng trở thành những bậc
              cha mẹ hạnh phúc.
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col">
            <h3 className="font-bold text-gray-700 mb-4">
              Vị trí của chúng tôi
            </h3>
            <p className="text-gray-500 text-sm">
              D1, Long Thạnh Mỹ
              <br />
              Thủ Đức, Hồ Chí Minh
              <br />
              Việt Nam
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col">
            <div>
              <h3 className="font-bold text-gray-700 mb-4">Gọi miễn phí</h3>
              <p className="text-[#ff8460] text-lg font-semibold mb-4">
                123-456-7890
              </p>
              <h3 className="font-bold text-gray-700 mb-2">
                Gửi email cho chúng tôi
              </h3>
              <p className="text-gray-500 text-sm">info@yoursite.com</p>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="flex flex-col items-center text-sm">
            <h3 className="font-bold text-gray-700 mb-4 text-center">
              Lịch làm việc
            </h3>

            {openingHours.map((item) => (
              <div key={item.day} className="mb-2 flex items-center gap-3">
                <div className="w-20 text-right font-semibold text-gray-800">
                  {item.day}
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md">
                    {item.morning}
                  </span>
                  <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md">
                    {item.afternoon}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            Bệnh viện Sinh sản NewLife © 2025. Mọi quyền được bảo lưu.
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium text-sm mr-2">Theo dõi chúng tôi</span>
            <a
              href="#"
              className="bg-lime-200 rounded-full w-8 h-8 flex items-center justify-center text-sm text-gray-600 hover:bg-lime-300"
            >
              X
            </a>
            <a
              href="#"
              className="bg-lime-200 rounded-full w-8 h-8 flex items-center justify-center text-sm text-gray-600 hover:bg-lime-300"
            >
              f
            </a>
            <a
              href="#"
              className="bg-lime-200 rounded-full w-8 h-8 flex items-center justify-center text-sm text-gray-600 hover:bg-lime-300"
            >
              📷
            </a>
            <a
              href="#"
              className="bg-lime-200 rounded-full w-8 h-8 flex items-center justify-center text-sm text-gray-600 hover:bg-lime-300"
            >
              🟢
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;
