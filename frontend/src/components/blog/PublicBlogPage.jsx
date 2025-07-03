import React, { useEffect, useState, useContext } from "react";
import { Card, Typography, List, Space, Tag, Input } from "antd";
import { blogService } from "../../service/blog.service";
import { NotificationContext } from "../../App";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Search } = Input;

const PublicBlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchApprovedBlogs();
  }, []);

  const fetchApprovedBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogsByStatus("APPROVED");
      if (response.data && response.data.result) {
        setBlogs(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching approved blogs:", error);
      showNotification("Không thể tải danh sách bài viết đã duyệt", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchText.toLowerCase()) ||
    blog.content.toLowerCase().includes(searchText.toLowerCase()) ||
    blog.authorName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center justify-between">
            <Title level={4} className="!mb-0">
              Bài Viết Blog
            </Title>
            <Search
              placeholder="Tìm kiếm bài viết"
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          </div>
        }
        className="shadow-md"
      >
        <List
          itemLayout="vertical"
          size="large"
          loading={loading}
          dataSource={filteredBlogs}
          pagination={{ pageSize: 5 }}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              extra={
                item.coverImageUrl && (
                  <img
                    width={272}
                    alt="cover"
                    src={item.coverImageUrl}
                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                  />
                )
              }
            >
              <List.Item.Meta
                title={<a href={`/blog/${item.id}`}>{item.title}</a>} // Assuming a route for single blog view
                description={
                  <Space>
                    <Tag color="blue">{item.authorName}</Tag>
                    <Text type="secondary">{dayjs(item.publishedAt).format("DD/MM/YYYY")}</Text>
                  </Space>
                }
              />
              {item.content && (
                <div
                  dangerouslySetInnerHTML={{ __html: item.content.length > 200 ? item.content.substring(0, 200) + '...' : item.content }}
                  className="text-gray-700 leading-relaxed"
                />
              )}
              {item.sourceReference && (
                <Text type="secondary" className="block mt-2">Nguồn tham khảo: {item.sourceReference}</Text>
              )}
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default PublicBlogPage; 