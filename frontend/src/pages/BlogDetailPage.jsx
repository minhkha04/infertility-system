import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Typography,
  Row,
  Col,
  Divider,
  Tag,
  Card,
  Avatar,
  Button,
  Space,
  List,
  message,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  TagOutlined,
  ClockCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import UserHeader from "../components/UserHeader";
import UserFooter from "../components/UserFooter";
import { blogService } from "../service/blog.service";
import dayjs from "dayjs";

const { Title, Paragraph, Text } = Typography;

// Blog posts data (removed - data will be fetched from API)
// const blogPostsData = [...]; // Removed hardcoded data

const BlogDetailPage = () => {
  const { blogSlug } = useParams(); // This is actually blogId from BlogPage
  const navigate = useNavigate();

  const [blogPost, setBlogPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the blog post from the backend
  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await blogService.getBlogPublicId(blogSlug); // Use blogSlug as blogId
        if (response.data && response.data.result) {
          setBlogPost(response.data.result);
          // For related posts, you might need another API call or backend logic to fetch them.
          // For now, relatedPosts will be empty or based on backend response if it provides them.
          // setRelatedPosts(response.data.result.relatedPosts || []); // Assuming backend provides relatedPosts
        } else {
          setError("Bài viết không tìm thấy hoặc có lỗi khi tải.");
          message.error("Không tìm thấy bài viết hoặc có lỗi.");
        }
      } catch (err) {
        console.error("Error fetching blog post:", err);
        setError("Không thể tải chi tiết bài viết. Vui lòng thử lại sau.");
        message.error("Không thể tải chi tiết bài viết.");
      } finally {
        setLoading(false);
      }
    };

    if (blogSlug) {
      fetchBlogPost();
    }
  }, [blogSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải chi tiết bài viết...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  // If blogPost is null after loading, it means not found or error occurred
  if (!blogPost) {
    return null; // Or render a "Blog Not Found" message
  }

  return (
    <div className="min-h-screen">
      <UserHeader />

      {/* Hero Banner */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <img
          src={blogPost.coverImageUrl || "/images/default-blog.jpg"}
          alt={blogPost.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-4xl px-4">
            <div className="flex justify-center items-center mb-4"></div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {blogPost.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={16}>
              {/* Author Info */}
              <div className="flex items-center mb-8">
                <div>
                  <Text strong className="block text-lg">
                    Tác giả: {blogPost.authorName}
                  </Text>
                  <Text strong className="block font-bold text-lg">
                    Nguồn tham khảo:{" "}
                    {blogPost.sourceReference || "Không có tham khảo nguồn"}
                  </Text>

                  <Text type="secondary" className="flex items-center">
                    <CalendarOutlined className="mr-2" />{" "}
                    {dayjs(blogPost.createdAt).format("DD/MM/YYYY")}
                  </Text>
                </div>
              </div>

              {/* Content */}
              <div className="blog-content mb-10">
                <Paragraph className="text-lg font-medium mb-8">
                  {blogPost.summary}
                </Paragraph>

                {blogPost.content &&
                  blogPost.content.split("\n").map(
                    (
                      paragraph,
                      index // Assuming content is a single string with \n for new lines
                    ) => (
                      <Paragraph key={index} className="text-gray-700 mb-6">
                        {paragraph}
                      </Paragraph>
                    )
                  )}
              </div>

              {/* Tags */}
              {blogPost.tags && blogPost.tags.length > 0 && (
                <div className="mb-8">
                  <Space size={[0, 8]} wrap>
                    <TagOutlined className="mr-1 text-gray-500" />
                    {blogPost.tags.map((tag, index) => (
                      <Tag key={index} color="blue">
                        {tag}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}

              {/* Share */}
              <Divider />
            </Col>

            {/* Sidebar */}
            <Col xs={24} lg={8}>
              {/* Subscribe */}
              <Card
                title="Đăng Ký"
                className="border border-gray-200"
                headStyle={{ borderBottom: "2px solid #ff8460" }}
              >
                <Paragraph>
                  Nhận các bài viết và thông tin mới nhất từ các chuyên gia sinh
                  sản của chúng tôi
                </Paragraph>
                <div className="mt-4">
                  <Button
                    type="primary"
                    className="w-full bg-[#ff8460] hover:bg-[#ff6b40] border-none"
                    onClick={() => navigate("/contacts")}
                  >
                    Liên Hệ Với Chúng Tôi
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default BlogDetailPage;
