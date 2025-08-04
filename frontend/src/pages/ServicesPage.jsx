import React, { useState, useEffect } from "react";
import { Typography, Row, Col, Button, Spin, Empty, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import UserFooter from "../components/UserFooter";
import { serviceService } from "../service/service.service";
import RecommendationSection from "../components/RecommendationSection";
import banner1 from "../../public/images/features/pc4.jpg";

const { Title, Text } = Typography;

const ServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hàm lấy danh sách dịch vụ
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      // Gọi API mới lấy danh sách dịch vụ public
      const response = await serviceService.getPublicServices({
        page: 0,
        size: 20,
      });
      if (
        response &&
        response.data &&
        response.data.result &&
        Array.isArray(response.data.result.content)
      ) {
        setServices(response.data.result.content);
      } else {
        setServices([]);
        setError("Không tìm thấy dữ liệu dịch vụ từ API");
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(`Không thể tải danh sách dịch vụ: ${err.message}`);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-orange-50">
      <UserHeader />

      {/* Hero Banner */}
      <div className="relative h-[660px] w-full overflow-hidden mb-0">
        <img
          src={banner1}
          alt="Băng rôn Dịch vụ"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Dịch Vụ
            </h1>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Title level={1} className="text-gray-800 mb-2">
              Những Gì Chúng Tôi Cung Cấp
            </Title>
            <div className="mt-2">
              <Text className="text-[#ff8460] font-medium text-lg uppercase">
                DỊCH VỤ CỦA CHÚNG TÔI
              </Text>
            </div>
          </div>

          {/* Services Display */}
          {loading ? (
            <div className="text-center py-10">
              <Spin size="large" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-10">
              <Empty description={error || "Không có dịch vụ nào"} />
              <Button onClick={() => fetchServices()} className="mt-3">
                Thử lại
              </Button>
            </div>
          ) : (
            <>
              <Row gutter={[32, 64]} className="justify-center">
                {services.map((service) => (
                  <Col xs={24} md={12} key={service.id}>
                    <Card
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer border-0 hover:scale-105"
                      onClick={() => navigate(`/service-detail/${service.id}`)}
                      styles={{ body: { padding: 0 } }}
                    >
                      <div className="relative overflow-hidden w-full h-72">
                        {service.coverImageUrl ? (
                          <img
                            src={service.coverImageUrl}
                            alt={service.name}
                            className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-110"
                            style={{
                              minHeight: "100%",
                              minWidth: "100%",
                              objectFit: "cover",
                              objectPosition: "center",
                            }}
                            onError={(e) => {
                              // Nếu hình từ API lỗi, ẩn hình đi
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#fff7f3] to-[#ffe5db] flex items-center justify-center">
                            <div className="text-center text-gray-400">
                              <div className="text-sm">Không có ảnh</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-2xl font-bold mb-3 text-gray-800">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {service.description ||
                            "Không có mô tả cho dịch vụ này."}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                          {service.price && (
                            <p className="text-[#ff8460] font-medium">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(service.price)}
                            </p>
                          )}
                          <span className="inline-flex items-center text-[#ff8460] hover:text-[#ff6b40] font-medium">
                            <PlusOutlined className="mr-1" /> Chi tiết
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </div>
      </div>

      {/* Recommendation Section */}
      <RecommendationSection />

      <UserFooter />
    </div>
  );
};

export default ServicesPage;
