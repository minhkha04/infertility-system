import React, { useState, useEffect, useContext } from "react";
import {
  Typography,
  Card,
  Row,
  Col,
  Avatar,
  Spin,
  Alert,
  Button,
  List,
  Rate,
} from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import UserHeader from "../components/UserHeader";
import UserFooter from "../components/UserFooter";
import { useParams, useNavigate } from "react-router-dom";
import { doctorService } from "../service/doctor.service";
import { getLocgetlStorage } from "../utils/util";
import { NotificationContext } from "../App";
import { useInfiniteQuery } from "@tanstack/react-query";
const { Title } = Typography;

const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [doctorRating, setDoctorRating] = useState(null);

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        setLoading(true);
        const response = await doctorService.getInfoDoctor(id);
        if (response.data && response.data.code === 1000) {
          setDoctor(response.data.result);
        } else {
          setError("Không thể tải thông tin bác sĩ");
        }
      } catch (error) {
        setError("Có lỗi xảy ra khi tải thông tin");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchDoctorInfo();
    }
  }, [id]);

  useEffect(() => {
    const fetchFeedbacks = async (page = 0) => {
      if (!id) return;
      try {
        const response = await doctorService.getDoctorFeedback(id, page, 5);
        if (response.data && response.data.code === 1000) {
        }
      } catch (error) {
        //
      }
    };
    fetchFeedbacks();
  }, [id]);

  const {
    data: feedbackPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingFeedbacks,
    isError: errorFeedbacks,
  } = useInfiniteQuery({
    queryKey: ["doctor-feedbacks", id],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await doctorService.getDoctorFeedback(id, pageParam, 1);
      return res.data.result; // chuẩn định dạng Spring Boot pagination
    },
    enabled: !!id,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.last ? undefined : allPages.length,
  });

  const feedbacks = feedbackPages?.pages.flatMap((page) => page.content) || [];

  if (loading) {
    return (
      <div className="w-full min-h-screen">
        <UserHeader />
        <div className="px-4 py-8 max-w-7xl mx-auto text-center">
          <Spin size="large" tip="Đang tải thông tin bác sĩ..." />
        </div>
        <UserFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen">
        <UserHeader />
        <div className="px-4 py-8 max-w-7xl mx-auto">
          <Alert message="Lỗi" description={error} type="error" showIcon />
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="w-full min-h-screen">
        <UserHeader />
        <div className="px-4 py-8 max-w-7xl mx-auto">
          <Alert message="Không tìm thấy bác sĩ" type="warning" showIcon />
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-screen"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "20px 0",
      }}
    >
      <UserHeader />
      <div className="px-4 py-8 max-w-5xl mx-auto">
        <Card
          className="shadow-2xl rounded-2xl p-8"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "none",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          }}
        >
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={6} className="flex flex-col items-center">
              <Avatar
                src={doctor.avatarUrl}
                size={180}
                className="border-4 border-orange-400 shadow-xl"
                style={{
                  boxShadow: "0 10px 30px rgba(255, 132, 96, 0.3)",
                }}
                icon={<UserOutlined />}
              />
              <div className="mt-6 text-center">
                {doctorRating !== null && (
                  <>
                    <Rate
                      disabled
                      allowHalf
                      value={doctorRating}
                      style={{ fontSize: 32 }}
                    />
                    <div className="text-gray-600 text-sm mt-2 font-medium">
                      Đánh giá tổng quan
                    </div>
                  </>
                )}
              </div>
            </Col>
            <Col xs={24} md={14}>
              <Title
                level={2}
                className="mb-4 text-orange-500"
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "700",
                  textShadow: "0 2px 4px rgba(255, 132, 96, 0.2)",
                }}
              >
                {doctor.fullName}
              </Title>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <UserOutlined className="mr-3 text-orange-400 text-lg" />
                  <span className="font-semibold mr-2 text-orange-400">
                    Chuyên khoa:
                  </span>
                  <span className="text-gray-800">
                    {doctor.specialty || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <MailOutlined className="mr-3 text-orange-400 text-lg" />
                  <span className="font-semibold mr-2 text-orange-400">
                    Email:
                  </span>
                  <span className="text-gray-800">
                    {doctor.email || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <PhoneOutlined className="mr-3 text-orange-400 text-lg" />
                  <span className="font-semibold mr-2 text-orange-400">
                    Số điện thoại:
                  </span>
                  <span className="text-gray-800">
                    {doctor.phoneNumber || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="mr-3 text-orange-400 font-semibold">
                    Bằng cấp:
                  </span>
                  <span className="text-gray-800">
                    {doctor.qualifications || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="mr-3 text-orange-400 font-semibold">
                    Năm tốt nghiệp:
                  </span>
                  <span className="text-gray-800">
                    {doctor.graduationYear || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="mr-3 text-orange-400 font-semibold">
                    Địa chỉ:
                  </span>
                  <span className="text-gray-800">
                    {doctor.address || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="mr-3 text-orange-400 font-semibold">
                    Kinh nghiệm:
                  </span>
                  <span className="text-gray-800">
                    {doctor.experienceYears
                      ? `${doctor.experienceYears} năm kinh nghiệm`
                      : "Chưa cập nhật"}
                  </span>
                </div>
              </div>
            </Col>
            <Col
              xs={24}
              md={4}
              className="flex flex-col items-center justify-center"
            >
              <Button
                type="primary"
                size="large"
                className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 border-none shadow-xl"
                style={{
                  height: "60px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  boxShadow: "0 8px 25px rgba(255, 132, 96, 0.4)",
                  minWidth: "160px",
                }}
                onClick={() => {
                  // Save doctor information to localStorage for later use
                  localStorage.setItem(
                    "pendingDoctorSelection",
                    JSON.stringify({
                      selectedDoctor: doctor.id,
                      doctorName: doctor.fullName,
                      doctorRole:
                        doctor.roleName?.description || "Bác sĩ chuyên khoa",
                      doctorSpecialization:
                        doctor.specialty || doctor.qualifications,
                      from: `/doctor/${id}`,
                    })
                  );

                  navigate("/register-service", {
                    state: {
                      selectedDoctor: doctor.id,
                      doctorName: doctor.fullName,
                      doctorRole:
                        doctor.roleName?.description || "Bác sĩ chuyên khoa",
                      doctorSpecialization:
                        doctor.specialty || doctor.qualifications,
                    },
                  });
                }}
              >
                Đặt lịch khám
              </Button>
            </Col>
          </Row>
        </Card>
        <Card
          title={
            <span
              style={{ fontSize: "1.5rem", fontWeight: "600", color: "#333" }}
            >
              Đánh giá từ bệnh nhân
            </span>
          }
          className="mt-8 shadow-2xl rounded-2xl"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "none",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            borderRadius: "16px",
          }}
        >
          {loadingFeedbacks ? (
            <div className="text-center py-6">
              <Spin tip="Đang tải đánh giá..." />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              Chưa có đánh giá nào từ bệnh nhân.
            </div>
          ) : (
            <>
              <List
                dataSource={feedbacks}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.customerFullName}
                      description={
                        <>
                          <Rate disabled defaultValue={item.rating} />
                          <p>{item.comment}</p>
                          <small>
                            Ngày:{" "}
                            {new Date(item.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </small>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
              {hasNextPage && (
                <div className="text-center mt-4">
                  <Button
                    type="primary"
                    onClick={() => fetchNextPage()}
                    loading={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? "Đang tải..." : "Xem thêm đánh giá"}
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
      <UserFooter />
    </div>
  );
};

export default DoctorDetailPage;
