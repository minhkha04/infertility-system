import React, { useState, useEffect } from "react";
import {
  Typography,
  Divider,
  Avatar,
  Tag,
  Button,
  Rate,
  Spin,
  Card,
} from "antd";
import { UserOutlined, CalendarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import UserFooter from "../components/UserFooter";
import { doctorService } from "../service/doctor.service";
import StarRatings from "react-star-ratings";
import { useInfiniteQuery } from "@tanstack/react-query";
import { path } from "../common/path";

const { Title, Paragraph, Text } = Typography;

const OurStaffPage = () => {
  const navigate = useNavigate();

  // Fetch doctors data from API
  const fetchDoctor = async ({ pageParam = 0 }) => {
    const res = await doctorService.getDoctorForCard(pageParam, 3);
    console.log(res);
    return res.data.result;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryFn: fetchDoctor,
    getNextPageParam: (lastPage, pages) => {
      // Kiểm tra xem còn trang tiếp theo không dựa trên totalPages
      return lastPage.page < lastPage.totalPages - 1 ? pages.length : undefined;
    },
  });

  const doctors = data?.pages.flatMap((page) => page.content) || [];

  const handleDoctorClick = (doctorId) => {
    navigate(path.doctorDetail.replace(":id", doctorId));
  };
  return (
    <div className="w-full min-h-screen bg-orange-50">
      <UserHeader />
      {/* Hero Banner */}
      <div className="relative h-[400px] w-full overflow-hidden mb-0">
        <img
          src="/images/features/pc7.jpg"
          alt="Băng rôn Blog"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-black opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Bác Sĩ
            </h1>
          </div>
        </div>
      </div>
      <div className="px-4 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <Title level={1} className="text-3xl">
            Đội ngũ chuyên gia
          </Title>
          <Paragraph className="text-lg mt-4">
            Gặp gỡ đội ngũ bác sĩ, chuyên gia và nhân viên y tế giàu kinh nghiệm
            của chúng tôi
          </Paragraph>
        </div>
        <Divider />
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <Card
                key={doctor.id}
                className="w-[250px] mx-auto mb-8 cursor-pointer shadow-lg rounded-xl border-0 hover:scale-105 transition-transform duration-300 bg-white overflow-hidden"
                onClick={() => handleDoctorClick(doctor.id)}
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
          {hasNextPage && (
            <div className="text-center mt-12">
              <Button
                onClick={() => fetchNextPage()}
                loading={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
              </Button>
            </div>
          )}
        </div>
        <Divider />
        <div className="my-12 text-center">
          <Title level={2} className="mb-4">
            Tham vấn với chuyên gia
          </Title>
          <Paragraph className="text-lg mb-6">
            Đặt lịch tư vấn với các chuyên gia của chúng tôi để được hỗ trợ về
            vấn đề hiếm muộn
          </Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<CalendarOutlined />}
            className="bg-[#ff8460] hover:bg-[#ff6b40] border-none rounded-full shadow-lg text-lg"
            onClick={() => navigate("/register-service")}
          >
            Đặt lịch hẹn
          </Button>
        </div>
      </div>
      <UserFooter />
    </div>
  );
};

export default OurStaffPage;
