import React, { useState, useEffect } from "react";
import {
  Typography,
  Row,
  Col,
  Divider,
  Space,
  Button,
  Card,
  message,
} from "antd";
import { RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import UserFooter from "../components/UserFooter";
import { blogService } from "../service/blog.service";
import dayjs from "dayjs";
import { useInfiniteQuery } from "@tanstack/react-query";
import banner1 from "../../public/images/features/pc8.jpg";

const { Title, Paragraph } = Typography;

const BlogPage = () => {
  const [blogExpand, setBlogExpand] = useState([]);

  const fetchBlogs = async ({ pageParam = 0 }) => {
    const res = await blogService.getBlogPublic("", pageParam, 3);
    setBlogExpand(res.data.result.content);
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
    queryKey: ["blogs"],
    queryFn: fetchBlogs,
    getNextPageParam: (lastPage, pages) => {
      // Nếu lastPage.last === true thì đã hết data (chuẩn theo Spring pagination)
      return lastPage.last ? undefined : pages.length;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    staleTime: Infinity, // hoặc vài phút nếu muốn
  });

  const blogPosts = data?.pages.flatMap((page) => page.content) || [];

  return (
    <div className="min-h-screen bg-orange-50">
      <UserHeader />
      {/* Hero Banner */}
      <div className="relative h-[660px] w-full overflow-hidden mb-0">
        <img
          src={banner1}
          alt="Băng rôn Blog"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Blogs
            </h1>
          </div>
        </div>
      </div>
      {/* Blog Content */}
      <div className="py-20 bg-orange-50">
        <div className="container mx-auto px-4">
          {blogPosts.length > 0 ? (
            <>
              <Row gutter={[32, 60]}>
                {blogPosts.slice(0, 3).map((post) => (
                  <Col xs={24} md={8} key={post.id}>
                    <Card
                      hoverable
                      className="h-full flex flex-col border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                      cover={
                        <div className="overflow-hidden">
                          <img
                            src={
                              post.coverImageUrl || "/images/default-blog.jpg"
                            }
                            alt={post.title}
                            className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      }
                    >
                      <div className="text-center flex-grow">
                        <div className="text-gray-500 text-sm mb-2">
                          {dayjs(post.createdAt).format("DD/MM/YYYY")}
                        </div>
                        <Title level={4} className="mb-4">
                          {post.title}
                        </Title>
                      </div>
                      <div className="text-center mt-auto">
                        <Link to={`/blog/${post.id}`}>
                          {" "}
                          {/* Changed to post.id for dynamic routing */}
                          <Button
                            type="text"
                            icon={
                              <RightOutlined className="bg-[#ff8460] text-white rounded-full p-1 mr-2" />
                            }
                            className="text-[#ff8460] hover:text-[#ff6b40]"
                          >
                            Thông Tin Thêm
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>

              {blogPosts.length > 3 && <Divider className="my-12" />}

              {blogPosts.length > 3 && (
                <Row gutter={[32, 60]}>
                  {blogPosts.slice(3, 6).map((post) => (
                    <Col xs={24} md={8} key={post.id}>
                      <Card
                        hoverable
                        className="h-full flex flex-col border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        cover={
                          <div className="overflow-hidden">
                            <img
                              src={
                                post.coverImageUrl || "/images/default-blog.jpg"
                              }
                              alt={post.title}
                              className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        }
                      >
                        <div className="text-center flex-grow">
                          <div className="text-gray-500 text-sm mb-2">
                            {dayjs(post.createdAt).format("DD/MM/YYYY")}
                          </div>
                          <Title level={4} className="mb-4">
                            {post.title}
                          </Title>
                        </div>
                        <div className="text-center mt-auto">
                          <Link to={`/blog/${post.id}`}>
                            <Button
                              type="text"
                              icon={
                                <RightOutlined className="bg-[#ff8460] text-white rounded-full p-1 mr-2" />
                              }
                              className="text-[#ff8460] hover:text-[#ff6b40]"
                            >
                              Thông Tin Thêm
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}

              {blogPosts.length > 6 && <Divider className="my-12" />}

              {blogPosts.length > 6 && (
                <Row gutter={[32, 60]}>
                  {blogPosts.slice(6, 9).map((post) => (
                    <Col xs={24} md={8} key={post.id}>
                      <Card
                        hoverable
                        className="h-full flex flex-col border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        cover={
                          <div className="overflow-hidden">
                            <img
                              src={
                                post.coverImageUrl || "/images/default-blog.jpg"
                              }
                              alt={post.title}
                              className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        }
                      >
                        <div className="text-center flex-grow">
                          <div className="text-gray-500 text-sm mb-2">
                            {dayjs(post.createdAt).format("DD/MM/YYYY")}
                          </div>
                          <Title level={4} className="mb-4">
                            {post.title}
                          </Title>
                        </div>
                        <div className="text-center mt-auto">
                          <Link to={`/blog/${post.id}`}>
                            <Button
                              type="text"
                              icon={
                                <RightOutlined className="bg-[#ff8460] text-white rounded-full p-1 mr-2" />
                              }
                              className="text-[#ff8460] hover:text-[#ff6b40]"
                            >
                              Thông Tin Thêm
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">
              Không có bài viết nào để hiển thị.
            </div>
          )}
        </div>
        {hasNextPage && (
          <div className="text-center mt-12">
            <Button
              onClick={() => fetchNextPage()}
              loading={isFetchingNextPage}
              disabled={blogExpand.length === 0}
            >
              {isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
            </Button>
          </div>
        )}
      </div>
      <UserFooter />
    </div>
  );
};

export default BlogPage;
