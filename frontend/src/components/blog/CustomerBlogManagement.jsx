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
} from "antd";
import { EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { blogService } from "../../service/blog.service";
import { useSelector } from "react-redux";
import { NotificationContext } from "../../App";
import { authService } from "../../service/auth.service";

/**
 * 👤 CUSTOMER BLOG MANAGEMENT COMPONENT - QUẢN LÝ BLOG CỦA KHÁCH HÀNG
 * 
 * Chức năng chính:
 * - Khách hàng tạo và quản lý blog chia sẻ kinh nghiệm
 * - Upload ảnh cho blog với compression tự động
 * - Gửi bài viết đi duyệt
 * - Chỉnh sửa bài viết nháp
 * 
 * Workflow:
 * 1. Load user info (khách hàng hiện tại)
 * 2. Fetch blogs của khách hàng này
 * 3. Create/Edit blog với form
 * 4. Upload image với compression
 * 5. Submit for review
 */

const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;

const statusMap = {
  PENDING_REVIEW: { color: "orange", text: "Chờ duyệt" },
  APPROVED: { color: "green", text: "Đã duyệt" },
  REJECTED: { color: "red", text: "Đã từ chối" },
  DRAFT: { color: "blue", text: "Bản nháp" },
  all: { color: "default", text: "Tất cả" },
};

const CustomerBlogManagement = () => {
  const [myBlogs, setMyBlogs] = useState([]);
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // backend page = 0-based
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        if (token?.token) {
          const response = await authService.getMyInfo(token.token);
          setCurrentUser(response.data.result);
        }
      } catch (error) {
        console.error("Error loading user info:", error);
        showNotification("Không thể tải thông tin người dùng", "error");
      }
    };
    loadUserInfo();
  }, [token, showNotification]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchMyBlogs(currentUser.id);
    }
  }, [currentUser]);

  const fetchMyBlogs = async (authorId, page = 0) => {
    try {
      setLoading(true);

      // Sử dụng getAllBlogs thay vì getBlogsByAuthor vì API getBlogsByAuthor có vấn đề
      const response = await blogService.getAllBlogs({
        page,
        size: 9,
      });

      setCurrentPage(page);
      setTotalPages(response.data.result.totalPages);
      if (response.data && response.data.result?.content) {
        // Filter blogs theo authorId hoặc authorName
        const allBlogs = response.data.result.content;

        // Lấy chi tiết cho từng blog để có thông tin author đầy đủ
        const blogsWithDetails = await Promise.all(
          allBlogs.map(async (blog) => {
            try {
              const detailResponse = await blogService.getBlogById(blog.id);
              const blogDetail = detailResponse.data.result;

              // Fallback: Nếu không có authorName, sử dụng thông tin user hiện tại
              if (!blogDetail.authorName && currentUser) {
                blogDetail.authorName =
                  currentUser.fullName || currentUser.username;
                blogDetail.authorType =
                  currentUser.role?.toUpperCase() || "CUSTOMER";
              }

              return {
                ...blog,
                ...blogDetail,
              };
            } catch (error) {
              // Fallback: Nếu không lấy được detail, thêm thông tin user hiện tại
              return {
                ...blog,
                authorName:
                  currentUser?.fullName || currentUser?.username || "N/A",
                authorType: currentUser?.role?.toUpperCase() || "CUSTOMER",
              };
            }
          })
        );

        const filteredBlogs = blogsWithDetails.filter((blog) => {
          // Kiểm tra theo authorId hoặc authorName
          const matchesAuthorId = blog.authorId === authorId;
          const matchesAuthorName =
            blog.authorName === currentUser?.fullName ||
            blog.authorName === currentUser?.username ||
            blog.authorName === currentUser?.name;

          // Kiểm tra theo authorType nếu là CUSTOMER
          const matchesAuthorType =
            blog.authorType === "CUSTOMER" && currentUser?.role === "customer";

          return matchesAuthorId || matchesAuthorName || matchesAuthorType;
        });

        setMyBlogs(filteredBlogs);
      } else {
        setMyBlogs([]);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setMyBlogs([]);
      showNotification("Không thể tải danh sách bài viết của bạn", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = myBlogs.filter((blog) => {
      const matchesStatus =
        statusFilter === "all" ? true : blog.status === statusFilter;
      const matchesSearch = blog.title
        .toLowerCase()
        .includes(searchText.toLowerCase());
      return matchesStatus && matchesSearch;
    });
    setFilteredData(filtered);
  }, [myBlogs, statusFilter, searchText]);

  const getStatusTag = (status) => {
    const statusInfo = statusMap[status];
    if (statusInfo) {
      return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
    } else {
      return <Tag>Không xác định</Tag>;
    }
  };

  const handleCreateBlog = () => {
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

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedBlog(null);
    setModalType("");
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
          showNotification("Bài viết đã được lưu !", "success");
          setIsModalVisible(false);
          form.resetFields();
          fetchMyBlogs(currentUser.id);
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
          status: "DRAFT",
        };
        await blogService.updateBlog(selectedBlog.id, updatedBlogData);
        showNotification("Bài viết đã được lưu !", "success");
        setIsModalVisible(false);
        form.resetFields();
        fetchMyBlogs(currentUser.id);
      }
    } catch (error) {
      console.error("Lỗi khi xử lý bài viết:", error);
      showNotification(
        error?.response?.data?.message || "Xử lý bài viết thất bại",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendForReview = async () => {
    setActionLoading(true);
    try {
      if (!selectedBlog || !currentUser || !currentUser.id) {
        showNotification(
          "Không thể gửi duyệt. Thông tin không đầy đủ.",
          "error"
        );
        return;
      }
      const values = form.getFieldsValue();
      await blogService.submitBlog(selectedBlog.id, {
        title: values.title,
        content: values.content,
        sourceReference: values.sourceReference,
      });
      showNotification("Bài viết đã được gửi duyệt thành công!", "success");
      setIsModalVisible(false);
      form.resetFields();
      fetchMyBlogs(currentUser.id);
    } catch (error) {
      showNotification(
        error?.response?.data?.message || "Gửi duyệt bài viết thất bại",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleSelectFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Kiểm tra loại file
      if (!file.type.startsWith("image/")) {
        showNotification(
          error?.response?.data?.message || "Vui lòng chọn file ảnh",
          "error"
        );
        return;
      }

      // Kiểm tra kích thước file (giới hạn 1MB cho backend)
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSize * 5) {
        // Nếu file > 5MB thì từ chối ngay
        showNotification(
          error?.response?.data?.message ||
            "File quá lớn. Vui lòng chọn file nhỏ hơn 5MB",
          "error"
        );
        return;
      }

      // Luôn compress để đảm bảo file nhỏ hơn 1MB
      let compressedFile = await compressImage(file);

      // Kiểm tra lại sau khi compress
      if (compressedFile.size > maxSize) {
        showNotification(
          error?.response?.data?.message ||
            "File vẫn quá lớn sau khi nén. Vui lòng chọn file nhỏ hơn.",
          "error"
        );
        return;
      }

      setSelectedFile(compressedFile);

      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onload = () => {
        setPreview(reader.result);
      };
    } catch (error) {
      console.error("Error processing file:", error);
      showNotification(
        error?.response?.data?.message || "Lỗi xử lý file. Vui lòng thử lại.",
        "error"
      );
    }
  };

  // Hàm compress image
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = document.createElement("img"); // Sử dụng document.createElement thay vì new Image()

        img.onload = () => {
          try {
            // Tính toán kích thước mới (giữ tỷ lệ, giảm kích thước)
            const maxWidth = 600; // Giảm từ 800 xuống 600
            const maxHeight = 400; // Giảm từ 600 xuống 400
            let { width, height } = img;

            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;

            // Vẽ image đã resize
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob với quality thấp hơn (0.6 thay vì 0.8)
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File([blob], file.name, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else {
                  reject(new Error("Không thể nén ảnh"));
                }
              },
              "image/jpeg",
              0.6
            ); // Giảm quality để file nhỏ hơn
          } catch (error) {
            console.error("Error during image compression:", error);
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error("Không thể tải ảnh"));
        };

        img.src = URL.createObjectURL(file);
      } catch (error) {
        console.error("Error creating image element:", error);
        reject(error);
      }
    });
  };

  // Handle Upload Img
  const handleUploadImg = async () => {
    if (!selectedFile || !selectedBlog?.id) return;
    setUploadingImage(true); // 🔥 Start loading

    try {
      const response = await blogService.uploadBlogImage(
        selectedBlog.id,
        selectedFile
      );

      if (response.data && response.data.result) {
        showNotification("Upload ảnh thành công", "success");

        // Cập nhật blog với ảnh mới
        setSelectedBlog((prev) => ({
          ...prev,
          coverImageUrl: response.data.result.coverImageUrl,
        }));

        // Refresh danh sách blogs
        fetchMyBlogs(currentUser.id);
      } else {
        showNotification("Upload ảnh thất bại", "error");
      }

      // Reset trạng thái
      setSelectedFile(null);
      setIsUploadModalOpen(false);
      setPreview(null);
    } catch (error) {
      console.error("Upload error:", error);

      // Xử lý các loại lỗi khác nhau
      if (error.code === "ERR_NETWORK") {
        showNotification("Lỗi kết nối mạng. Vui lòng thử lại sau.", "error");
      } else if (error.message?.includes("CORS")) {
        showNotification(
          "Lỗi CORS. Vui lòng kiểm tra kết nối mạng hoặc liên hệ admin.",
          "error"
        );
      } else if (error.response?.status === 413) {
        showNotification(
          "File quá lớn. Vui lòng chọn file nhỏ hơn 1MB.",
          "error"
        );
      } else if (error.response?.status === 403) {
        showNotification("Không có quyền upload ảnh cho blog này.", "error");
      } else if (error.response?.status === 401) {
        showNotification(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          "error"
        );
      } else if (error.response?.status === 0) {
        showNotification(
          "Không thể kết nối đến server. Vui lòng kiểm tra mạng.",
          "error"
        );
      } else {
        showNotification(
          error.response?.data?.message || "Upload ảnh thất bại",
          "error"
        );
      }
    } finally {
      setUploadingImage(false); // 🔥 End loading
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
      render: (title, record) => (
        <div>
          <div className="font-semibold">{title}</div>
          {record.featured && (
            <Tag color="gold" size="small">
              Nổi bật
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Tác giả",
      dataIndex: "authorName",
      key: "authorName",
      render: (authorName, record) => {
        return (
          <div className="font-medium">
            {authorName || record.author || currentUser?.fullName || "N/A"}
            {record.authorType && (
              <div className="text-xs text-gray-500">
                {record.authorType === "DOCTOR"
                  ? "Bác sĩ"
                  : record.authorType === "CUSTOMER"
                  ? "Khách hàng"
                  : record.authorType === "MANAGER"
                  ? "Quản lý"
                  : record.authorType}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
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
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => viewBlog(record)}
            >
              Xem
            </Button>
            {record.status === "DRAFT" && (
              <Button
                size="small"
                type="primary"
                icon={<EditOutlined />}
                onClick={() => editBlog(record)}
                loading={actionLoading}
              >
                Sửa
              </Button>
            )}
            <Button
              size="small"
              style={{
                backgroundColor: "#FFA500",
                color: "white",
                border: "none",
              }}
              onClick={() => {
                setSelectedBlog(record); // 👈 CHỌN BLOG
                setIsUploadModalOpen(true); // 👈 MỞ MODAL
              }}
            >
              Upload ảnh
            </Button>
          </Space>
        </Space>
      ),
    },
  ];

  return (
    <Card className="blog-management-card">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateBlog}
          >
            Tạo Blog
          </Button>

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

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading || actionLoading}
        pagination={false}
      />
      <div className="flex justify-end mt-4">
        <Button
          disabled={currentPage === 0}
          onClick={() => fetchMyBlogs(currentPage - 1)}
          className="mr-2"
        >
          Trang trước
        </Button>
        <span className="px-4 py-1 bg-gray-100 rounded text-sm">
          Trang {currentPage + 1} / {totalPages}
        </span>
        <Button
          disabled={currentPage + 1 >= totalPages}
          onClick={() => fetchMyBlogs(currentPage + 1)}
          className="ml-2"
        >
          Trang tiếp
        </Button>
      </div>
      {/* { Modal upload ảnh cho blog} */}
      <Modal
        title={`Cập nhật ảnh cho blog: ${selectedBlog?.title || ""}`}
        open={isUploadModalOpen}
        onCancel={() => {
          setIsUploadModalOpen(false);
          setSelectedFile(null);
          setPreview(null);
        }}
        footer={null}
        destroyOnHidden
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Ảnh blog</h3>
          <img
            src={preview || selectedBlog?.image || "/default-blog.jpg"}
            alt="Avatar Preview"
            className="w-32 h-32 rounded-full object-cover border mx-auto mb-4"
          />
          <label
            htmlFor="fileInput"
            className="cursor-pointer bg-gray-200 px-4 py-1 rounded hover:bg-gray-300 transition inline-block"
          >
            Chọn ảnh
          </label>
          <input
            type="file"
            id="fileInput"
            onChange={handleSelectFile}
            className="hidden"
          />
          <p className="text-sm text-gray-600 mt-2">
            {selectedFile ? (
              <span>
                {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                <br />
                <span className="text-xs text-gray-500">
                  Giới hạn: 1MB, Tự động nén ảnh (600x400px, quality 60%)
                </span>
              </span>
            ) : (
              "Chưa chọn ảnh nào"
            )}
          </p>
          <Button
            type="primary"
            loading={uploadingImage}
            disabled={!selectedFile}
            onClick={handleUploadImg}
            className="mt-3"
          >
            {uploadingImage ? "Đang upload..." : "Lưu ảnh"}
          </Button>
        </div>
      </Modal>

      <Modal
        title={
          modalType === "create"
            ? "Tạo bài viết mới"
            : modalType === "edit"
            ? "Chỉnh sửa bài viết"
            : "Xem bài viết"
        }
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={
          modalType === "view"
            ? [
                <Button key="close" onClick={handleModalCancel}>
                  Đóng
                </Button>,
              ]
            : [
                <Button key="back" onClick={handleModalCancel}>
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
                modalType === "edit" && selectedBlog?.status === "DRAFT" && (
                  <Button
                    key="submitReview"
                    type="primary"
                    onClick={handleSendForReview}
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
              <TextArea rows={10} />
            </Form.Item>
            <Form.Item name="sourceReference" label="Tham chiếu nguồn">
              <Input />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </Card>
  );
};

export default CustomerBlogManagement;
