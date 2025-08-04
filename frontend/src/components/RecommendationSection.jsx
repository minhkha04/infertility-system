import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import banner1 from "../../public/images/features/pc9.jpg";

const RecommendationSection = () => {
  const navigate = useNavigate();

  return (
    <div
      className="py-20 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${banner1})` }}
    >
      <div className="absolute inset-0 bg-black opacity-50" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center text-center min-h-[340px]">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Mọi Người Đề Xuất Chúng Tôi
          </h2>
          <div className="text-[#ff8460] font-medium mb-4">
            TẠI SAO CHỌN CHÚNG TÔI
          </div>
          <p className="mb-8 max-w-xl text-white">
            Chúng tôi cung cấp sự chăm sóc và quan tâm cá nhân hóa cho mỗi khách
            hàng trong hành trình làm cha mẹ của họ. Chúng tôi cung cấp xét
            nghiệm toàn diện để xác định nguyên nhân vô sinh ở nam và nữ, và
            chúng tôi chuyên về IUI và IVF.
          </p>
          <Button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate("/contacts");
            }}
            className="bg-[#ff8460] hover:bg-[#ff6b40] text-white border-none rounded py-3 px-8 mx-auto"
          >
            Liên Hệ Với Chúng Tôi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationSection;
