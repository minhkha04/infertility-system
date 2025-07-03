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

const { Title, Paragraph, Text } = Typography;

const contactInfo = [
  {
    title: "Địa chỉ",
    content: "123 Đường New Life, Trung tâm Thành phố",
    icon: <EnvironmentOutlined style={{ fontSize: 24, color: "#15A1AC" }} />,
  },
  {
    title: "Email",
    content: "info@newlife.com",
    icon: <MailOutlined style={{ fontSize: 24, color: "#15A1AC" }} />,
  },
  {
    title: "Điện thoại",
    content: "+1 858 794 6363",
    icon: <PhoneOutlined style={{ fontSize: 24, color: "#15A1AC" }} />,
  },
  {
    title: "Giờ làm việc",
    content: "Thứ Hai - Thứ Bảy: 8:00 - 17:00",
    icon: <ClockCircleOutlined style={{ fontSize: 24, color: "#15A1AC" }} />,
  },
];

const ContactsPage = () => {
  return (
    <div className="min-h-screen bg-orange-50">
      <UserHeader />

      {/* Hero Banner */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <img
          src="/images/features/pc7.jpg"
          alt="Băng rôn Liên hệ"
          className="w-full h-full object-cover"
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
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0951782923237!2d105.77960851476353!3d21.028774785998286!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab4cd0c66f05%3A0xea31563511af2e54!2sFPT%20University!5e0!3m2!1sen!2s!4v1652103525381!5m2!1sen!2s"
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
