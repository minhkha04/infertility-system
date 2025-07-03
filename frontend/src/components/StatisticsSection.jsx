import React from 'react';

const StatisticsSection = () => {
  return (
    <div className="py-16 bg-cover bg-center text-white" style={{backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/images/features/pc7.jpg')"}}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="flex justify-center">
            <div className="rounded-full border-4 border-white p-6 w-64 h-64 flex flex-col items-center justify-center shadow-lg">
              <span className="text-white opacity-80 text-sm">HƠN</span>
              <div className="text-6xl font-bold text-white">1250</div>
              <span className="text-[#ff8460] text-sm">Gia Đình Hạnh Phúc</span>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-bold mb-2">Mọi Người Khuyên Dùng Chúng Tôi</h2>
            <span className="text-[#ff8460] font-medium block mb-4">TẠI SAO CHỌN CHÚNG TÔI</span>
            <p className="mb-6 text-lg">
              Chúng tôi cung cấp sự chăm sóc và quan tâm cá nhân hóa cho mỗi khách hàng trong hành trình làm cha mẹ của họ. 
              Chúng tôi cung cấp các xét nghiệm toàn diện để xác định nguyên nhân của vô sinh ở nam và nữ, 
              và chúng tôi chuyên về IUI và IVF.
            </p>
            <button className="bg-[#ff8460] hover:bg-[#ff6b40] text-white font-semibold py-3 px-6 rounded transition duration-300 ease-in-out">
              Liên Hệ Với Chúng Tôi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsSection;