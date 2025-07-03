import React, { useState, useEffect, useContext } from "react";
import {
  Carousel,
  Typography,
  Row,
  Col,
  Card,
  Button,
  Input,
  Form,
  Checkbox,
  Space,
  Statistic,
  Avatar,
  Tag,
  Rate,
  Spin,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import UserHeader from "../components/UserHeader";
import UserFooter from "../components/UserFooter";
import { Outlet, useNavigate, Link } from "react-router-dom";
import SevicesChild from "../components/SevicesChild";
import StatisticsSection from "../components/StatisticsSection";
import ServicesIcons from "../components/ServicesIcons";
import RecommendationSection from "../components/RecommendationSection";
import { doctorService } from "../service/doctor.service";
import StarRatings from "react-star-ratings";
import { path } from "../common/path";
import { NotificationContext } from "../App";
import { useSelector } from "react-redux";

const { Title, Paragraph, Text } = Typography;

const UserTemplate = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useContext(NotificationContext);
  const token = useSelector((state) => state.authSlice.token);

  // Fetch doctors data from API
  useEffect(() => {
    const fetchDoctors = async (page = 0) => {
      try {
        setLoading(true);
        const response = await doctorService.getDoctorForCard(page, 3);
        setDoctors([]);
        setDoctors(response.data.result.content);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

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

    // Nếu có quyền thì chuyển hướng
    navigate("/register-service");
  };

  const handleServicesClick = (e) => {
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

    // Nếu có quyền thì chuyển hướng
    navigate("/services");
  };

  const handleStaffClick = (e) => {
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

    // Nếu có quyền thì chuyển hướng
    navigate(path.ourStaff);
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <UserHeader />

      {/* Hero Slider */}
      <Carousel
        autoplay
        effect="fade"
        dots={true}
        autoplaySpeed={5000}
        className="mb-0"
      >
        <div>
          <div className="relative h-[600px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/features/pc9.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
                  Điều Kỳ Diệu Của Bạn.
                  <br />
                  Sứ Mệnh Của Chúng Tôi.
                </h1>
                <Button
                  onClick={handleBookAppointment}
                  className="bg-[#ff8460] hover:bg-[#ff6b40] text-white font-semibold py-4 px-10 rounded-full shadow-lg text-lg border-none"
                  size="large"
                >
                  Đặt Lịch Hẹn
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="relative h-[600px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/features/Pc1.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
                  Chăm Sóc Chuyên Nghiệp.
                  <br />
                  Gia Đình Hạnh Phúc.
                </h1>
                <Button
                  onClick={handleServicesClick}
                  className="bg-[#ff8460] hover:bg-[#ff6b40] text-white font-semibold py-4 px-10 rounded-full shadow-lg text-lg border-none"
                  size="large"
                >
                  Tìm Hiểu Về Dịch Vụ Của Chúng Tôi
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="relative h-[600px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/features/pc7.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
                  Công Nghệ Tiên Tiến.
                  <br />
                  Chăm Sóc Tận Tâm.
                </h1>
                <Button
                  onClick={handleStaffClick}
                  className="bg-[#ff8460] hover:bg-[#ff6b40] text-white font-semibold py-4 px-10 rounded-full shadow-lg text-lg border-none"
                  size="large"
                >
                  Gặp Gỡ Các Chuyên Gia Của Chúng Tôi
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Carousel>

      {/* Services Icons Component */}
      <ServicesIcons />

      {/* Welcome Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2 text-center md:text-left">
              <span className="text-[#ff8460] font-medium text-lg">
                CHÀO MỪNG BẠN!
              </span>
              <h2 className="text-4xl font-bold mt-2 mb-6">
                Chào Mừng Đến Với
                <br />
                Trung Tâm Sinh Sản
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Chúng tôi cung cấp tất cả các dịch vụ y tế mà bạn cần. Mục tiêu
                của chúng tôi là làm cho khách hàng trở thành những bậc cha mẹ
                hạnh phúc. Chúng tôi thực hiện điều này một cách dễ dàng nhất có
                thể để các cặp đôi có thể có con, dù là thông qua việc sử dụng
                trứng hiến tặng hay người mang thai hộ.
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="rounded-full border-4 border-[#ff8460] p-2 w-64 h-64 flex flex-col items-center justify-center shadow-lg bg-white">
                  <span className="text-gray-400 text-sm">HƠN</span>
                  <div className="text-6xl text-[#ff8460] font-bold">
                    87<span className="text-2xl">%</span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    Thai Kỳ Thành Công
                  </span>
                </div>
                <div className="absolute -right-12 bottom-4">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                    alt="Bác sĩ"
                    className="rounded-full w-40 h-40 object-cover border-4 border-white shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Center Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <Row gutter={[48, 48]} className="items-center">
            <Col xs={24} md={12}>
              <div className="text-center md:text-left">
                <span className="text-[#ff8460] font-medium text-lg">
                  GIỚI THIỆU
                </span>
                <h2 className="text-4xl font-bold mt-2 mb-6">
                  Trung tâm
                  <br />
                  Hỗ trợ Sinh sản
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Trung tâm Hỗ trợ Sinh sản của chúng tôi được thành lập vào năm
                  2010 với sứ mệnh mang lại hạnh phúc cho các gia đình đang gặp
                  khó khăn trong việc có con. Với hơn 10 năm kinh nghiệm, chúng
                  tôi đã giúp hàng ngàn cặp vợ chồng hiện thực hóa giấc mơ làm
                  cha mẹ thông qua việc áp dụng các kỹ thuật điều trị sinh sản
                  tiên tiến nhất.
                </p>
                <div className="space-y-4 mb-8">
                  <div
                    className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-300 group"
                    onClick={() => navigate("/service-detail/2")}
                  >
                    <div className="bg-[#ff8460] rounded-full w-8 h-8 flex items-center justify-center text-white mr-4 group-hover:bg-[#ff6b40] transition duration-300">
                      <ArrowRightOutlined />
                    </div>
                    <span className="hover:text-[#ff8460] transition duration-300 font-medium">
                      Thụ tinh trong ống nghiệm (IVF)
                    </span>
                  </div>
                  <div
                    className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-300 group"
                    onClick={() => navigate("/service-detail/1")}
                  >
                    <div className="bg-[#ff8460] rounded-full w-8 h-8 flex items-center justify-center text-white mr-4 group-hover:bg-[#ff6b40] transition duration-300">
                      <ArrowRightOutlined />
                    </div>
                    <span className="hover:text-[#ff8460] transition duration-300 font-medium">
                      Thụ tinh nhân tạo (IUI)
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    window.scrollTo(0, 0);
                    navigate("/services");
                  }}
                  className="bg-[#ff8460] hover:bg-[#ff6b40] text-white font-semibold py-3 px-8 rounded-full shadow-lg text-lg border-none"
                  size="large"
                >
                  Tìm hiểu Thêm
                </Button>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="relative flex justify-center">
                <img
                  src="/images/features/pc5.jpg"
                  alt="Mẹ và bé"
                  className="w-full max-w-md rounded-lg shadow-xl"
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Our Doctors */}
      <div className="py-20 bg-orange-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              Đội ngũ Chuyên gia
            </h2>
            <span className="text-white font-medium text-lg">
              BÁC SĨ CỦA CHÚNG TÔI
            </span>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <Spin size="large" />
              <p className="text-white mt-4">Đang tải thông tin bác sĩ...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white text-lg">
                Hiện tại chưa có thông tin bác sĩ. Vui lòng thử lại sau.
              </p>
              <p className="text-white text-sm mt-2">
                Nếu vấn đề vẫn tiếp diễn, hãy liên hệ với bộ phận hỗ trợ.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {doctors.slice(0, 3).map((doctor) => (
                <Card
                  key={doctor.id}
                  className="w-[250px] mx-auto mb-8 cursor-pointer shadow-lg rounded-xl border-0 hover:scale-105 transition-transform duration-300 bg-white overflow-hidden"
                  onClick={() => navigate(`/doctors/detail/${doctor.id}`)}
                  styles={{ body: { padding: 0 } }}
                >
                  <img
                    src={doctor.avatarUrl}
                    alt={doctor.fullName}
                    className="w-full h-[280px] object-cover"
                  />
                  <div className="relative p-2 text-center -mt-8 bg-white">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {doctor.fullName}
                    </h3>
                    <div className="mt-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-700">
                          Chuyên khoa:
                        </span>{" "}
                        {doctor.specialty}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-700">
                          Bằng cấp:
                        </span>{" "}
                        {doctor.qualifications}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-700">
                          Kinh nghiệm:
                        </span>{" "}
                        {doctor.experienceYears} năm
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-center">
                      <StarRatings
                        rating={doctor.rate}
                        starRatedColor="#fadb14"
                        numberOfStars={5}
                        name="rating"
                        starDimension="16px"
                        starSpacing="1px"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        ({doctor.rate})
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Button
              onClick={() => navigate(path.ourStaff)}
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-8 rounded-full shadow-lg text-lg border-none"
              size="large"
            >
              Xem Toàn Bộ Đội Ngũ ({doctors.length} bác sĩ)
            </Button>
          </div>
        </div>
      </div>

      {/* Recommendation Section */}
      <RecommendationSection />

      <Outlet />
      <UserFooter />
    </div>
  );
};

export default UserTemplate;
