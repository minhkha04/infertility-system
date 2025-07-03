import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Typography,
  Table,
  Button,
  Space,
  Tag,
  Select,
  Input,
  Modal,
  Form,
  Image,
  Avatar,
  Switch,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  PlusOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { blogService } from "../../service/blog.service";
import { useSelector } from "react-redux";
import { NotificationContext } from "../../App";
import { authService } from "../../service/auth.service";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option = Select.Option } = Select;
const { Search } = Input;
const { TextArea } = Input;

const statusMap = {
  PENDING_REVIEW: { color: "orange", text: "Chờ duyệt" },
  APPROVED: { color: "green", text: "Đã duyệt" },
  REJECTED: { color: "red", text: "Đã từ chối" },
  DRAFT: { color: "blue", text: "Bản nháp" },
  HIDDEN: { color: "gray", text: "Đã ẩn" },
  all: { color: "default", text: "Tất cả" },
};

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); // create, edit, view
  const [form] = Form.useForm();
  const token = useSelector((state) => state.authSlice);
  const { showNotification } = useContext(NotificationContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState(""); // approve, reject
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0); // page từ 0
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBlogs(currentPage, pageSize);
  }, []);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        if (token?.token) {
          const response = await authService.getMyInfo(token.token);
          setCurrentUser(response.data.result);
        }
      } catch (error) {
        showNotification("Không thể tải thông tin người dùng", "error");
      }
    };
    loadUserInfo();
  }, [token, showNotification]);

  const fetchBlogs = async (page = 0) => {
    try {
      setLoading(true);

      const response = await blogService.getAllBlogs({
        page: page,
        size: 5,
      });

      console.log("getAllBlogs response:", response);

      if (response.data && response.data.result?.content) {
        const allBlogs = response.data.result.content;

        // Lấy chi tiết cho từng blog để có thông tin đầy đủ
        const blogsWithDetails = await Promise.all(
          allBlogs.map(async (blog) => {
            try {
              const detailResponse = await blogService.getBlogById(blog.id);
              return {
                ...blog,
                ...detailResponse.data.result,
              };
            } catch (error) {
              return blog;
            }
          })
        );

        setBlogs(blogsWithDetails);
        setCurrentPage(page);
        setPageSize(size);
        setTotalPages(response.data.result.totalPages);

        console.log("Loaded", blogsWithDetails.length, "blogs");
      } else {
        console.log("No blogs found or invalid response structure");
        setBlogs([]);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      showNotification("Không thể tải danh sách bài viết", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = blogs.filter((blog) => {
      const matchesStatus =
        statusFilter === "all" ? true : blog.status === statusFilter;
      const matchesSearch =
        blog.title.toLowerCase().includes(searchText.toLowerCase()) ||
        blog.authorName.toLowerCase().includes(searchText.toLowerCase());
      return matchesStatus && matchesSearch;
    });
    setFilteredData(filtered);
  }, [blogs, statusFilter, searchText]);

  const getStatusTag = (status) => {
    const statusInfo = statusMap[status];
    if (statusInfo) {
      return (
        <Tag color={statusInfo.color} style={{ fontWeight: 600 }}>
          {statusInfo.text}
        </Tag>
      );
    } else {
      return <Tag>Không xác định</Tag>;
    }
  };

  const createBlog = () => {
    setSelectedBlog(null);
    setModalType("create");
    form.resetFields();
    setIsModalVisible(true);
  };

  const editBlog = (blog) => {
    setSelectedBlog(blog);
    setModalType("edit");
    form.setFieldsValue({
      title: blog.title,
      content: blog.content,
      sourceReference: blog.sourceReference,
      featured: blog.featured || false,
    });
    setIsModalVisible(true);
  };

  const viewBlog = (blog) => {
    setSelectedBlog(blog);
    setModalType("view");
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    setActionLoading(true);
    try {
      if (modalType === "create") {
        if (!currentUser || !currentUser.id) {
          showNotification(
            "Không thể lấy thông tin người dùng để tạo bài viết.",
            "error"
          );
          return;
        }
        const response = await blogService.createBlog({
          title: values.title,
          content: values.content,
          sourceReference: values.sourceReference,
          status: "DRAFT",
        });
        if (response.data) {
          showNotification("Bài viết đã được lưu dưới dạng nháp!", "success");
          setIsModalVisible(false);
          form.resetFields();
          fetchBlogs();
        }
      } else if (modalType === "edit") {
        if (!selectedBlog || !currentUser || !currentUser.id) {
          showNotification(
            "Không thể cập nhật bài viết. Thông tin không đầy đủ.",
            "error"
          );
          return;
        }
        const updatedBlogData = {
          ...selectedBlog,
          ...values,
        };
        await blogService.updateBlog(selectedBlog.id, updatedBlogData);
        showNotification("Bài viết đã được cập nhật!", "success");
        setIsModalVisible(false);
        form.resetFields();
        fetchBlogs();
      }
    } catch (error) {
      showNotification("Xử lý bài viết thất bại", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendForReview = async (values, isNewBlog) => {
    setActionLoading(true);
    try {
      if (!currentUser || !currentUser.id) {
        showNotification(
          "Vui lòng đăng nhập để tạo hoặc gửi bài viết đi duyệt",
          "error"
        );
        return;
      }
      if (isNewBlog) {
        const response = await blogService.createBlog({
          title: values.title,
          content: values.content,
          sourceReference: values.sourceReference,
          status: "PENDING_REVIEW",
        });
        if (response.data) {
          showNotification(
            "Bài viết đã được gửi, chờ quản lý duyệt!",
            "success"
          );
          setIsModalVisible(false);
          form.resetFields();
          fetchBlogs();
        }
      } else {
        if (!selectedBlog) {
          showNotification("Không tìm thấy bài viết để gửi duyệt.", "error");
          return;
        }
        const updatedBlogData = {
          ...selectedBlog,
          ...values,
        };
        await blogService.updateBlog(selectedBlog.id, updatedBlogData);
        await blogService.submitBlog(selectedBlog.id, updatedBlogData);
        showNotification("Bài viết đã được gửi duyệt thành công!", "success");
        setIsModalVisible(false);
        form.resetFields();
        fetchBlogs();
      }
    } catch (error) {
      showNotification("Gửi duyệt bài viết thất bại", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = (blog) => {
    setSelectedBlog(blog);
    setActionType("approve");
    setIsActionModalVisible(true);
  };

  const handleReject = (blog) => {
    setSelectedBlog(blog);
    setActionType("reject");
    setIsActionModalVisible(true);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleActionModalCancel = () => {
    setIsActionModalVisible(false);
    setSelectedBlog(null);
    setActionType("");
    form.resetFields();
  };

  const handleActionSubmit = async (values) => {
    if (!selectedBlog) return;

    setActionLoading(true);
    try {
      const newStatus = actionType === "approve" ? "APPROVED" : "REJECTED";
      const comment = values.comment || "";

      const response = await blogService.updateBlogStatus(selectedBlog.id, {
        status: newStatus,
        comment: comment,
      });

      if (response.data) {
        const actionText = actionType === "approve" ? "duyệt" : "từ chối";
        showNotification(`Đã ${actionText} bài viết thành công!`, "success");
        setIsActionModalVisible(false);
        setSelectedBlog(null);
        setActionType("");
        form.resetFields();
        fetchBlogs(); // Refresh danh sách
      }
    } catch (error) {
      console.error("Error updating blog status:", error);
      const actionText = actionType === "approve" ? "duyệt" : "từ chối";
      showNotification(`Lỗi khi ${actionText} bài viết`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleHideBlog = async (blogId) => {
    setActionLoading(true);
    try {
      await blogService.hideBlog(blogId);
      showNotification("Bài viết đã được ẩn!", "success");
      fetchBlogs();
    } catch (error) {
      console.error("Error hiding blog:", error);
      showNotification("Ẩn bài viết thất bại", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnhideBlog = async (blogId) => {
    setActionLoading(true);
    try {
      // Sử dụng updateStatus để chuyển từ HIDDEN về APPROVED
      await blogService.updateBlogStatus(blogId, {
        status: "APPROVED",
        comment: "Hiện lại bài viết",
      });
      showNotification("Bài viết đã được hiện lại!", "success");
      fetchBlogs();
    } catch (error) {
      console.error("Error unhiding blog:", error);
      showNotification("Hiện lại bài viết thất bại", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: "Hình ảnh",
      key: "coverImageUrl",
      render: (_, record) => (
        <Image
          width={60}
          height={40}
          src={record.coverImageUrl || "/images/default-blog.jpg"}
          fallback="/images/default-blog.jpg"
          style={{ objectFit: "cover", borderRadius: "4px" }}
        />
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <span
          className="font-medium cursor-pointer text-blue-600 hover:underline"
          onClick={() => navigate(`/blog-detail/${record.id}`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Tác giả",
      dataIndex: "authorName",
      key: "authorName",
      render: (authorName) => (
        <div className="flex items-center">
          <Avatar size="small" icon={<UserOutlined />} className="mr-2" />
          {authorName}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: Object.keys(statusMap).map((key) => ({
        text: statusMap[key].text,
        value: key,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => dayjs(createdAt).format("DD/MM/YYYY"),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space wrap>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => viewBlog(record)}
            >
              Xem
            </Button>
          </Space>
          <Space wrap>
            {record.status === "PENDING_REVIEW" && (
              <>
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record)}
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                >
                  Duyệt
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleReject(record)}
                >
                  Từ chối
                </Button>
              </>
            )}
            {record.status === "APPROVED" && (
              <Button
                size="small"
                danger
                icon={<EyeInvisibleOutlined />}
                onClick={() => handleHideBlog(record.id)}
                loading={actionLoading}
              >
                Ẩn
              </Button>
            )}
            {record.status === "HIDDEN" && (
              <Button
                size="small"
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => handleUnhideBlog(record.id)}
                loading={actionLoading}
              >
                Hiện lại
              </Button>
            )}
          </Space>
        </Space>
      ),
    },
  ];

  return (
    <Card className="blog-management-card">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <Select
            defaultValue="all"
            style={{ width: 120 }}
            onChange={setStatusFilter}
            value={statusFilter}
          >
            {Object.entries(statusMap).map(([key, value]) => (
              <Option key={key} value={key}>
                {value.text}
              </Option>
            ))}
          </Select>
          <Search
            placeholder="Tìm kiếm bài viết..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 200 }}
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button
          disabled={currentPage === 0}
          onClick={() => fetchBlogs(currentPage - 1, pageSize)}
          className="mr-2"
        >
          Trang trước
        </Button>
        <span className="px-4 py-1 bg-gray-100 rounded text-sm">
          Trang {currentPage + 1} / {totalPages}
        </span>
        <Button
          disabled={currentPage + 1 >= totalPages}
          onClick={() => fetchBlogs(currentPage + 1, pageSize)}
          className="ml-2"
        >
          Trang tiếp
        </Button>
      </div>

      <Modal
        title={
          modalType === "create"
            ? "Tạo bài viết mới"
            : modalType === "edit"
            ? "Chỉnh sửa bài viết"
            : "Xem bài viết"
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={
          modalType === "view"
            ? [
                <Button key="close" onClick={() => setIsModalVisible(false)}>
                  Đóng
                </Button>,
              ]
            : [
                <Button
                  key="back"
                  onClick={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                  }}
                >
                  Hủy
                </Button>,
                <Button
                  key="saveDraft"
                  onClick={() => form.submit()}
                  type="primary"
                  loading={actionLoading}
                >
                  Lưu
                </Button>,
                (modalType === "create" ||
                  (modalType === "edit" &&
                    selectedBlog?.status === "DRAFT")) && (
                  <Button
                    key="submitReview"
                    type="primary"
                    onClick={() =>
                      handleSendForReview(
                        form.getFieldsValue(),
                        modalType === "create"
                      )
                    }
                    loading={actionLoading}
                  >
                    Gửi duyệt
                  </Button>
                ),
              ]
        }
        width={800}
        destroyOnHidden
      >
        {modalType === "view" ? (
          selectedBlog && (
            <div>
              <h2 className="text-xl font-bold mb-4">{selectedBlog.title}</h2>
              <div className="mb-4">
                <p className="text-gray-600">
                  Tác giả: {selectedBlog.authorName}
                </p>
                <p className="text-gray-600">
                  Ngày tạo: {dayjs(selectedBlog.createdAt).format("DD/MM/YYYY")}
                </p>
                <p className="text-gray-600">
                  Trạng thái: {getStatusTag(selectedBlog.status)}
                </p>
                {selectedBlog.approvedByName && (
                  <p className="text-gray-600">
                    Người duyệt: {selectedBlog.approvedByName}
                  </p>
                )}
                {selectedBlog.note && (
                  <p className="text-gray-600">Ghi chú: {selectedBlog.note}</p>
                )}
                {selectedBlog.sourceReference && (
                  <p className="text-gray-600">
                    Tham chiếu: {selectedBlog.sourceReference}
                  </p>
                )}
              </div>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
              ></div>
            </div>
          )
        ) : (
          <Form
            form={form}
            layout="vertical"
            name="blog_form"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="content"
              label="Nội dung"
              rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
            >
              <Input.TextArea rows={10} />
            </Form.Item>
            <Form.Item name="sourceReference" label="Tham chiếu nguồn">
              <Input />
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title={actionType === "approve" ? "Duyệt bài viết" : "Từ chối bài viết"}
        open={isActionModalVisible}
        onCancel={handleActionModalCancel}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleActionSubmit}>
          <Form.Item
            name="comment"
            label={
              actionType === "approve" ? "Ghi chú (tùy chọn)" : "Lý do từ chối"
            }
            rules={
              actionType === "reject"
                ? [{ required: true, message: "Vui lòng nhập lý do từ chối!" }]
                : []
            }
          >
            <TextArea
              rows={4}
              placeholder={
                actionType === "approve"
                  ? "Nhập ghi chú nếu cần..."
                  : "Nhập lý do từ chối bài viết..."
              }
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={handleActionModalCancel}>Hủy</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={actionLoading}
              style={
                actionType === "reject"
                  ? { backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }
                  : { backgroundColor: "#52c41a", borderColor: "#52c41a" }
              }
            >
              {actionType === "approve" ? "Duyệt" : "Từ chối"}
            </Button>
          </div>
        </Form>
      </Modal>
    </Card>
  );
};

export default BlogManagement;
