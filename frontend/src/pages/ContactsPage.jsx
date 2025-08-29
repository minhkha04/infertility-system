import React from "react";
import { Typography, Card, Row, Col, Divider } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import UserHeader from "../components/UserHeader";
import UserFooter from "../components/UserFooter";
import { href } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const contactInfo = [
  {
    title: "Địa chỉ",
    content: "D1, Long Thạnh Mỹ\nThủ Đức, Hồ Chí Minh\nViệt Nam",
    icon: <EnvironmentOutlined style={{ fontSize: 24, color: "#15A1AC" }} />,
  },
  {
    title: "Email",
    content: (
      <a href="mailto:infertilitytreatmentmonitoring@gmail.com">
        infertilitytreatmentmonitoring@gmail.com
      </a>
    ),
    icon: <MailOutlined style={{ fontSize: 24, color: "#15A1AC" }} />,
  },
  {
    title: "Điện thoại",
    content: <a href="tel:0346810167">+84 0346810167</a>,
    icon: <PhoneOutlined style={{ fontSize: 24, color: "#15A1AC" }} />,
  },
  {
    title: "Giờ làm việc",
    content: "Thứ Hai - Chủ nhật: 8:00 - 12:00\n 13:00 - 17:00",
    icon: <ClockCircleOutlined style={{ fontSize: 24, color: "#15A1AC" }} />,
  },
];

const ContactsPage = () => {
  return (
    <div className="min-h-screen bg-orange-50">
      <UserHeader />

      {/* Hero Banner */}
      <div className="relative h-[660px] w-full overflow-hidden">
        <img
          src="/images/features/pc7.jpg"
          alt="Băng rôn Liên hệ"
          className="w-full h-full  bg-top"
        />
        <div className="absolute inset-0 bg-black opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              Liên Hệ Với Chúng Tôi
            </h1>
          </div>
        </div>
      </div>

      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2">Giữ Liên Lạc</h2>
            <span className="text-[#ff8460] font-medium">
              CHÚNG TÔI Ở ĐÂY VÌ BẠN
            </span>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={24}>
              <div className="w-full h-[500px] bg-gray-200 mb-8">
                {/* Google Map sẽ được hiển thị tại đây */}
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7861022.200665203!2d100.88622862839156!3d15.836100067798924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgVFAuIEhDTQ!5e0!3m2!1svi!2sus!4v1752825958791!5m2!1svi!2sus"
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {contactInfo.map((item, index) => (
                  <Card
                    key={index}
                    className="text-center shadow-md transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="flex flex-col items-center">
                      <div className="mb-4 bg-[#f0f8ff] w-16 h-16 rounded-full flex items-center justify-center">
                        {React.cloneElement(item.icon, {
                          style: { fontSize: 28, color: "#ff8460" },
                        })}
                      </div>
                      <Title level={4} className="mb-2">
                        {item.title}
                      </Title>
                      <Text className="text-gray-600">{item.content}</Text>
                    </div>
                  </Card>
                ))}
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default ContactsPage;
