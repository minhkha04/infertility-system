import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Divider,
  List,
  Tag,
  Space,
  Spin,
  Alert,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  RightCircleOutlined,
  UserOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import UserHeader from "../components/UserHeader";
import UserFooter from "../components/UserFooter";
import { serviceService } from "../service/service.service";
import { doctorService } from "../service/doctor.service";
import { NotificationContext } from "../App";
import { useSelector } from "react-redux";

const { Title, Paragraph, Text } = Typography;

// Hàm lấy hình ảnh dựa trên loại điều trị
const getServiceImage = (treatmentType) => {
  const imageMap = {
    IUI: "/images/features/pc6.jpg",
    IVF: "/images/features/pc4.jpg",
    "Diagnostic Testing": "/images/features/pc9.jpg",
    "Embryo Testing": "/images/features/pc11.jpg",
    "Egg Freezing": "/images/features/pc12.jpg",
  };

  return imageMap[treatmentType] || "/images/features/pc4.jpg";
};

const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialists, setSpecialists] = useState([]);
  const [stages, setStages] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [benefits, setBenefits] = useState([]);
  const [typeDescription, setTypeDescription] = useState("");
  const { showNotification } = useContext(NotificationContext);
  const token = useSelector((state) => state.authSlice.token);

  // Lấy thông tin dịch vụ và giai đoạn điều trị
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId) {
        navigate("/services");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        // Gọi API public mới
        const response = await serviceService.getPublicServiceById(serviceId);
        console.log("Service details response:", response);
        if (response && response.data && response.data.result) {
          const serviceData = response.data.result;
          setService(serviceData);

          // Lấy lợi ích dựa trên ID dịch vụ
          setBenefits(getBenefitsByServiceId(serviceData.id));

          // Nếu có loại điều trị, tìm giai đoạn điều trị
          if (serviceData.treatmentTypeId) {
            try {
              const stagesResponse =
                await serviceService.getTreatmentStagesByTypeId(
                  serviceData.treatmentTypeId
                );
              if (
                stagesResponse &&
                stagesResponse.data &&
                stagesResponse.data.result
              ) {
                console.log("Treatment stages:", stagesResponse.data.result);

                // Lấy dữ liệu giai đoạn và sắp xếp theo orderIndex
                let stagesData = Array.isArray(stagesResponse.data.result)
                  ? stagesResponse.data.result
                  : [stagesResponse.data.result];

                // Sắp xếp giai đoạn theo orderIndex
                stagesData = stagesData.sort((a, b) => {
                  // Nếu orderIndex tồn tại, sắp xếp theo đó, nếu không thì sắp xếp theo id
                  const orderA =
                    a.orderIndex !== undefined ? a.orderIndex : a.id;
                  const orderB =
                    b.orderIndex !== undefined ? b.orderIndex : b.id;
                  return orderA - orderB;
                });

                setStages(stagesData);
              }
            } catch (stagesError) {
              console.error("Error fetching treatment stages:", stagesError);
              // Không set lỗi vì không muốn ảnh hưởng đến hiển thị dịch vụ
            }
          }
        } else {
          setError("Không tìm thấy thông tin dịch vụ");
        }
      } catch (err) {
        setError(`Lỗi khi tải thông tin dịch vụ: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchServiceDetails();
  }, [serviceId, navigate]);

  // Lấy thông tin loại điều trị từ API dựa vào id của service
  useEffect(() => {
    if (!service || !service.treatmentTypeId) return;
    const fetchType = async () => {
      try {
        const res = await serviceService.getAllTreatmentTypes();
        if (res?.data?.result) {
          const found = res.data.result.find(
            (item) => item.id === service.treatmentTypeId
          );
          setTypeDescription(found?.description || "");
        }
      } catch (error) {
        setTypeDescription("");
      }
    };
    fetchType();
  }, [service]);

  const handleBookAppointment = (e) => {
    e.preventDefault();

    // Kiểm tra role
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    if (userInfo.roleName && userInfo.roleName.name !== "CUSTOMER") {
      showNotification(
        "Bạn không có quyền đăng ký lịch hẹn. Chỉ khách hàng mới có thể sử dụng tính năng này.",
        "error"
      );
      return;
    }

    // Nếu có quyền thì chuyển hướng - sử dụng đúng field names từ API
    navigate("/register-service", {
      state: {
        selectedService: service?.serviceId,
        serviceName: service?.serviceName,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <UserHeader />
        <div className="py-16 flex items-center justify-center">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4">Đang tải thông tin dịch vụ...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <UserHeader />
        <div className="py-16 container mx-auto px-4">
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            className="mb-4"
          />
          <div className="text-center mt-4">
            <Button
              type="primary"
              onClick={() => navigate("/services")}
              className="bg-[#ff8460] hover:bg-[#ff6b40] border-none"
            >
              Quay lại trang Dịch Vụ
            </Button>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen">
        <UserHeader />
        <div className="py-16 container mx-auto px-4 text-center">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Không tìm thấy dịch vụ</h2>
          </div>
          <Button
            type="primary"
            onClick={() => navigate("/services")}
            className="bg-[#ff8460] hover:bg-[#ff6b40] border-none"
          >
            Quay lại trang Dịch Vụ
          </Button>
        </div>
        <UserFooter />
      </div>
    );
  }

  // Chuyển đổi các giai đoạn điều trị để hiển thị
  const treatmentProcess =
    stages.length > 0
      ? stages.map((stage) => ({
          name: stage.name,
          description: stage.description,
        }))
      : [];

  return (
    <div className="min-h-screen">
      <UserHeader />

      {/* Hero Banner */}

      {/* Service Description Section */}
      <div className="py-16 bg-gradient-to-br from-[#fff7f3] to-[#ffe5db]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Title level={2} className="mb-2">
              {service.name}
            </Title>
            <Text className="text-[#ff8460] text-lg">
              {service.treatmentTypeName}
            </Text>
          </div>

          <Row gutter={[32, 32]}>
            {/* Bên trái: Giới thiệu + Tuyến trình điều trị */}
            <Col xs={24} lg={16}>
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <Title level={3} className="mb-6">
                  Giới thiệu về {service.name}
                </Title>
                {/* Ảnh dịch vụ từ API nếu có */}
                {service.coverImageUrl && (
                  <div className="mb-6 flex justify-center">
                    <img
                      src={service.coverImageUrl}
                      alt={service.name}
                      className="max-h-64 rounded-lg shadow"
                      style={{ maxWidth: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
                <Paragraph className="text-gray-700 mb-4">
                  {typeDescription ||
                    service.description ||
                    "Không có mô tả chi tiết cho dịch vụ này."}
                </Paragraph>
              </div>
              {/* Tuyến trình điều trị */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Title
                  level={3}
                  className="text-[#ff8460] font-bold mb-8 text-center tracking-wide flex items-center gap-2"
                >
                  <span>
                    <CalendarOutlined />
                  </span>{" "}
                  Tuyến trình điều trị
                </Title>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {service.treatmentStageResponses &&
                  service.treatmentStageResponses.length > 0 ? (
                    service.treatmentStageResponses.map((stage) => (
                      <div
                        key={stage.id}
                        className="bg-[#fff7f3] rounded-xl shadow border-l-4 border-[#ff8460] p-4 flex items-center gap-4 hover:shadow-lg transition-all"
                      >
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-[#ff8460] to-[#ff6b40] text-white text-xl font-bold shadow">
                          {stage.orderIndex}
                        </div>
                        <div className="flex-1">
                          <div className="text-[#ff6b40] font-semibold text-base mb-1">
                            {stage.name}
                          </div>
                          <Tag
                            color="#ff8460"
                            className="rounded-full px-3 py-0.5 text-xs font-bold bg-[#fff3ed] border-none"
                          >
                            Khoảng ngày: {stage.expectedDayRange}
                          </Tag>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center text-gray-500">
                      Chưa có dữ liệu các bước điều trị.
                    </div>
                  )}
                </div>
              </div>
            </Col>
            {/* Bên phải: Đăng ký dịch vụ + Tại sao chọn chúng tôi */}
            <Col xs={24} lg={8}>
              <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
                <Title level={4} className="mb-6 flex items-center">
                  <CalendarOutlined className="mr-2 text-[#ff8460]" />
                  Đăng ký dịch vụ
                </Title>
                <Paragraph className="mb-6">
                  Bạn muốn tìm hiểu thêm về{" "}
                  {service.name ? service.name.toLowerCase() : ""}? Đặt lịch tư
                  vấn với một trong những chuyên gia của chúng tôi để thảo luận
                  về tình huống và nhu cầu cụ thể của bạn.
                </Paragraph>
                <div className="mb-4">
                  <Text strong>Giá dịch vụ: </Text>
                  <Text className="text-[#ff8460] font-medium">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(service.price)}
                  </Text>
                </div>
                <div className="mb-4">
                  <Text strong>Thời gian điều trị: </Text>
                  <Text>{service.duration} ngày</Text>
                </div>
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleBookAppointment}
                  className="bg-[#ff8460] hover:bg-[#ff6b40] border-none"
                >
                  Đặt Lịch Hẹn
                </Button>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <Title level={4} className="mb-4 flex items-center">
                  <TeamOutlined className="mr-2 text-[#ff8460]" />
                  Tại Sao Chọn Chúng Tôi
                </Title>
                <List
                  dataSource={[
                    "Các chuyên gia giàu kinh nghiệm với tỷ lệ thành công đã được chứng minh",
                    "Cơ sở vật chất và công nghệ hiện đại",
                    "Kế hoạch điều trị cá nhân hóa cho mỗi bệnh nhân",
                    "Hỗ trợ toàn diện trong suốt hành trình của bạn",
                    "Giá cả minh bạch và các lựa chọn tài chính",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Space>
                        <RightCircleOutlined className="text-[#ff8460]" />
                        <Text>{item}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default ServiceDetailPage;
