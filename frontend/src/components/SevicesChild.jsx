import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SevicesChild = () => {
  const navigate = useNavigate();

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-700 mb-2">Những Gì Chúng Tôi Cung Cấp</h2>
            <div className="mt-2">
              <span className="text-[#ff8460] font-medium">DỊCH VỤ</span>
            </div>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-2">
            <img 
              src="/images/features/pc4.jpg" 
              className="h-56 w-full object-cover"
              alt="Người Hiến Trứng"
            />
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-4">Người Hiến Trứng và Mang Thai Hộ</h3>
              <p className="text-gray-600 mb-4">
                Tại trung tâm của chúng tôi, chúng tôi có kiến thức và kinh nghiệm toàn diện trong lĩnh vực hiến trứng 
                và mang thai hộ. Chúng tôi có cơ sở dữ liệu đang phát triển với 1.000 người hiến tặng.
              </p>
              <Link to="/service/egg-donor" className="text-[#ff8460] font-medium hover:text-[#ff6b40] inline-block">
                <span className="mr-1">+</span> Thông Tin Thêm
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-2">
            <img 
              src="/images/features/pc6.jpg" 
              className="h-56 w-full object-cover"
              alt="Đông Lạnh Trứng"
            />
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-4">Đông Lạnh / Bảo Quản Trứng</h3>
              <p className="text-gray-600 mb-4">
                Việc bảo quản khả năng sinh sản nói chung, và đông lạnh trứng nói riêng, đang nhanh chóng trở thành một 
                thủ tục phổ biến hơn đối với phụ nữ trên toàn thế giới mỗi năm.
              </p>
              <Link to="/service/egg-freezing" className="text-[#ff8460] font-medium hover:text-[#ff6b40] inline-block">
                <span className="mr-1">+</span> Thông Tin Thêm
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-2">
            <img 
              src="/images/features/iui-vs-ivf.jpg" 
              className="h-56 w-full object-cover"
              alt="Lựa Chọn Giới Tính"
            />
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-4">Lựa Chọn Giới Tính</h3>
              <p className="text-gray-600 mb-4">
                Lựa chọn giới tính có thể được thực hiện trước hoặc sau khi trứng được thụ tinh. Lựa chọn giới tính là 
                nỗ lực kiểm soát giới tính của con cái.
              </p>
              <Link to="/service/gender-selection" className="text-[#ff8460] font-medium hover:text-[#ff6b40] inline-block">
                <span className="mr-1">+</span> Thông Tin Thêm
              </Link>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <button 
            onClick={() => navigate('/services')}
            className="bg-[#ff8460] hover:bg-[#ff6b40] text-white font-semibold py-3 px-8 rounded transition duration-300 ease-in-out"
          >
            Các Chương Trình Khác
          </button>
        </div>
      </div>
    </div>
  );
};

export default SevicesChild;