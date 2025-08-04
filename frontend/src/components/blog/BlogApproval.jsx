import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Modal,
  Input,
} from "antd";
import { blogService } from "../../service/blog.service";
import { useSelector } from "react-redux";
import { NotificationContext } from "../../App";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";

/**
 * ✅ BLOG APPROVAL COMPONENT - DUYỆT BÀI VIẾT
 * 
 * Chức năng chính:
 * - Quản lý duyệt bài viết chờ xử lý
 * - Xem chi tiết bài viết trước khi duyệt
 * - Thêm comment khi duyệt/từ chối
 * - Chỉ hiển thị bài viết có status "PENDING_REVIEW"
 * 
 * Workflow:
 * 1. Fetch pending blogs từ API
 * 2. Hiển thị danh sách bài viết chờ duyệt
 * 3. View chi tiết bài viết
 * 4. Approve/Reject với comment
 * 5. Refresh danh sách sau khi duyệt
 */

const { Title } = Typography;

const BlogApproval = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const token = useSelector((state) => state.authSlice);
  const { showNotification } = useContext(NotificationContext);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState({
    blogId: null,
    status: null,
  });
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    fetchPendingBlogs();
  }, []);

  const fetchPendingBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogsByStatus("PENDING_REVIEW");
      if (response.data) {
        setBlogs(response.data.result);
      }
    } catch (error) {
      console.error("Error fetching pending blogs:", error);
      showNotification("Không thể tải danh sách bài viết", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewBlog = (blog) => {
    setSelectedBlog(blog);
    setIsModalVisible(true);
  };

  const handleApprove = async (blogId) => {
    setCurrentAction({ blogId, status: "APPROVED" });
    setIsCommentModalVisible(true);
  };

  const handleReject = async (blogId) => {
    setCurrentAction({ blogId, status: "REJECTED" });
    setIsCommentModalVisible(true);
  };

  const handleCommentSubmit = async () => {
    try {
      if (!token?.token || !token?.infoUser?.id) {
        showNotification("Không có thông tin người dùng quản lý.", "error");
        return;
      }

      const { blogId, status } = currentAction;
      if (!blogId || !status) {
        showNotification(
          "Thông tin bài viết hoặc trạng thái không hợp lệ.",
          "error"
        );
        return;
      }
      console.log("Blog ID from currentAction:", blogId);
      console.log("Manager ID from token:", token.infoUser.id);
      console.log("Token:", token.token);
      console.log("Request Body:", { action: status, comment: commentText });

      const response = await blogService.approveBlog(
        blogId,
        token.infoUser.id,
        token.token,
        { action: status, comment: commentText }
      );

      if (response.data && response.data.result) {
        showNotification(
          `Bài viết đã được ${
            status === "APPROVED" ? "duyệt" : "từ chối"
          } thành công!`,
          "success"
        );
        setIsCommentModalVisible(false);
        setCommentText(""); // Clear comment
        fetchPendingBlogs(); // Refresh danh sách
      } else {
        showNotification("Thao tác thất bại.", "error");
      }
    } catch (error) {
      console.error("Error processing blog action:", error);
      showNotification("Không thể thực hiện thao tác", "error");
    }
  };

  const handleCommentModalCancel = () => {
    setIsCommentModalVisible(false);
    setCommentText("");
    setCurrentAction({ blogId: null, status: null });
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handleViewBlog(record)}>
            Xem
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => {
              setCurrentAction({ blogId: record.id, status: "APPROVED" });
              setIsCommentModalVisible(true);
            }}
          >
            Duyệt
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => {
              setCurrentAction({ blogId: record.id, status: "REJECTED" });
              setIsCommentModalVisible(true);
            }}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center justify-between">
            <Title level={4} className="!mb-0">
              Duyệt Bài Viết
            </Title>
          </div>
        }
        className="shadow-md"
      >
        <Table
          columns={columns}
          dataSource={blogs}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Chi tiết bài viết"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedBlog && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Tiêu đề</h3>
              <p>{selectedBlog.title}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Tóm tắt</h3>
              <p>{selectedBlog.summary}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Nội dung</h3>
              <p className="whitespace-pre-wrap">{selectedBlog.content}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Thông tin khác</h3>
              <p>Tác giả: {selectedBlog.author}</p>
              <p>Danh mục: {selectedBlog.category}</p>
              <p>Tags: {selectedBlog.tags?.join(", ")}</p>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => {
                  handleApprove(selectedBlog.id);
                  setIsModalVisible(false);
                }}
                style={{ backgroundColor: "#52c41a" }}
              >
                Duyệt
              </Button>
              <Button
                type="primary"
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  handleReject(selectedBlog.id);
                  setIsModalVisible(false);
                }}
              >
                Từ chối
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={`Thêm bình luận cho bài viết ${
          currentAction.status === "APPROVED" ? "duyệt" : "từ chối"
        }`}
        open={isCommentModalVisible}
        onOk={handleCommentSubmit}
        onCancel={handleCommentModalCancel}
        okText="Gửi"
        cancelText="Hủy"
      >
        <Input.TextArea
          rows={4}
          placeholder="Nhập bình luận của bạn (ví dụ: Bài viết đạt yêu cầu; Nội dung cần sửa đổi)..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default BlogApproval;
