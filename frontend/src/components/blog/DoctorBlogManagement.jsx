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

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;

/**
 * DOCTOR BLOG MANAGEMENT COMPONENT - QUẢN LÝ BLOG CỦA BÁC SĨ
 * 
 * Chức năng chính:
 * - Bác sĩ tạo và quản lý blog của mình
 * - Upload ảnh cho blog với compression tự động
 * - Gửi bài viết đi duyệt
 * - Chỉnh sửa bài viết nháp
 * 
 * Workflow:
 * 1. Load user info (bác sĩ hiện tại)
 * 2. Fetch blogs của bác sĩ này
 * 3. Create/Edit blog với form
 * 4. Upload image với compression
 * 5. Submit for review
 */

// MAPPING TRẠNG THÁI BLOG - ĐỊNH NGHĨA MÀU SẮC VÀ TEXT CHO TỪNG STATUS
const statusMap = {
  PENDING_REVIEW: { color: "orange", text: "Chờ duyệt" },
  APPROVED: { color: "green", text: "Đã duyệt" },
  REJECTED: { color: "red", text: "Đã từ chối" },
  DRAFT: { color: "blue", text: "Bản nháp" },
  HIDDEN: { color: "#bfbfbf", text: "Đã ẩn" },
  all: { color: "default", text: "Tất cả" },
};

const DoctorBlogManagement = () => {
  // STATE MANAGEMENT - QUẢN LÝ TRẠNG THÁI COMPONENT
  const [myBlogs, setMyBlogs] = useState([]); // Danh sách blog của bác sĩ
  const [loading, setLoading] = useState(false); // Loading khi fetch data
  const [actionLoading, setActionLoading] = useState(false); // Loading khi thực hiện action
  const [filteredData, setFilteredData] = useState([]); // Data đã được filter
  const [statusFilter, setStatusFilter] = useState("all"); // Filter theo status
  const [searchText, setSearchText] = useState(""); // Text tìm kiếm
  const [selectedBlog, setSelectedBlog] = useState(null); // Blog được chọn để xem/sửa
  const [isModalVisible, setIsModalVisible] = useState(false); // Hiển thị modal
  const [modalType, setModalType] = useState(""); // Loại modal: create, edit, view
  const [form] = Form.useForm(); // Form instance cho Ant Design
  const token = useSelector((state) => state.authSlice); // Token từ Redux store
  const { showNotification } = useContext(NotificationContext); // Context để hiển thị notification
  const [currentUser, setCurrentUser] = useState(null); // Thông tin bác sĩ hiện tại
  
  // IMAGE UPLOAD STATES - TRẠNG THÁI UPLOAD ẢNH
  const [selectedFile, setSelectedFile] = useState(null); // File ảnh được chọn
  const [preview, setPreview] = useState(null); // Preview ảnh
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); // Modal upload ảnh
  const [uploadingImage, setUploadingImage] = useState(false); // Loading khi upload
  
  // PAGINATION STATES - TRẠNG THÁI PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(0); // Trang hiện tại (backend page = 0-based)
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang

  // LOAD USER INFO - TẢI THÔNG TIN BÁC SĨ HIỆN TẠI
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

  // FETCH BLOGS WHEN USER LOADED - TẢI BLOG KHI USER ĐÃ LOAD
  useEffect(() => {
    if (currentUser?.id) {
      fetchMyBlogs(currentUser.id);
    }
  }, [currentUser]);

     /**
    * FETCH MY BLOGS - LẤY DANH SÁCH BLOG CỦA BÁC SĨ
    * 
    * Quy trình:
    * 1. Gọi API getAllBlogs với pagination
    * 2. Filter blogs theo authorId/authorName/authorType
    * 3. Lấy chi tiết từng blog để có thông tin đầy đủ
    * 4. Cập nhật state blogs và pagination
    * 
    * @param {string} authorId - ID của bác sĩ
    * @param {number} page - Số trang (0-based)
    */
  const fetchMyBlogs = async (authorId, page = 0) => {
    try {
      setLoading(true);

      // GỌI API GET ALL BLOGS VỚI PAGINATION
      // Sử dụng getAllBlogs thay vì getBlogsByAuthor vì API getBlogsByAuthor có vấn đề
      const response = await blogService.getAllBlogs({
        page,
        size: 9, // Số lượng blog mỗi trang
      });
      setCurrentPage(page);
      setTotalPages(response.data.result.totalPages);
      if (response.data && response.data.result?.content) {
        // FILTER BLOGS THEO AUTHORID HOẶC AUTHORNAME
        const allBlogs = response.data.result.content;

        // LẤY CHI TIẾT CHO TỪNG BLOG ĐỂ CÓ THÔNG TIN AUTHOR ĐẦY ĐỦ
        // Sử dụng Promise.all để gọi song song nhiều API
        const blogsWithDetails = await Promise.all(
          allBlogs.map(async (blog) => {
            try {
              const detailResponse = await blogService.getBlogById(blog.id);
              const blogDetail = detailResponse.data.result;

              // FALLBACK: NẾU KHÔNG CÓ AUTHORNAME, SỬ DỤNG THÔNG TIN USER HIỆN TẠI
              if (!blogDetail.authorName && currentUser) {
                blogDetail.authorName =
                  currentUser.fullName || currentUser.username;
                blogDetail.authorType =
                  currentUser.role?.toUpperCase() || "DOCTOR";
              }

              return {
                ...blog,
                ...blogDetail,
              };
            } catch (error) {
              // FALLBACK: NẾU KHÔNG LẤY ĐƯỢC DETAIL, THÊM THÔNG TIN USER HIỆN TẠI
              return {
                ...blog,
                authorName:
                  currentUser?.fullName || currentUser?.username || "N/A",
                authorType: currentUser?.role?.toUpperCase() || "DOCTOR",
              };
            }
          })
        );

        // FILTER BLOGS THEO AUTHOR
        const filteredBlogs = blogsWithDetails.filter((blog) => {
          // Kiểm tra theo authorId hoặc authorName
          const matchesAuthorId = blog.authorId === authorId;
          const matchesAuthorName =
            blog.authorName === currentUser?.fullName ||
            blog.authorName === currentUser?.username ||
            blog.authorName === `Dr. ${currentUser?.fullName}` ||
            blog.authorName === `Dr. ${currentUser?.username}` ||
            blog.authorName === currentUser?.name;

          // Kiểm tra theo authorType nếu là DOCTOR
          const matchesAuthorType =
            blog.authorType === "DOCTOR" && currentUser?.role === "doctor";

          return matchesAuthorId || matchesAuthorName || matchesAuthorType;
        });

        // TẠM THỜI HIỂN THỊ TẤT CẢ BLOGS ĐỂ DEBUG
        if (filteredBlogs.length === 0 && blogsWithDetails.length > 0) {
          setMyBlogs(blogsWithDetails);
        } else {
          setMyBlogs(filteredBlogs);
        }
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

  /**
   * 🔍 FILTER & SEARCH - LỌC VÀ TÌM KIẾM BLOG
   * 
   * Logic filter:
   * 1. Filter theo status (all, PENDING_REVIEW, APPROVED, etc.)
   * 2. Search theo title
   */
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

  /**
   * 🏷️ GET STATUS TAG - TẠO TAG HIỂN THỊ TRẠNG THÁI
   * 
   * @param {string} status - Trạng thái blog
   * @returns {JSX.Element} Tag component với màu sắc tương ứng
   */
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

  /**
   * 🆕 HANDLE CREATE BLOG - TẠO BLOG MỚI
   */
  const handleCreateBlog = () => {
    setSelectedBlog(null);
    setModalType("create");
    form.resetFields();
    setIsModalVisible(true);
  };

  /**
   * 👁️ VIEW BLOG - XEM CHI TIẾT BLOG
   * 
   * @param {Object} blog - Blog object cần xem
   */
  const viewBlog = (blog) => {
    setSelectedBlog(blog);
    setModalType("view");
    setIsModalVisible(true);
  };

  /**
   * 🚫 HANDLE MODAL CANCEL - HỦY MODAL
   */
  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedBlog(null);
    setModalType("");
  };

  /**
   * 💾 HANDLE SUBMIT - XỬ LÝ TẠO/SỬA BLOG
   * 
   * Workflow:
   * 1. Validate user info
   * 2. Gọi API create/update blog với status DRAFT
   * 3. Hiển thị notification
   * 4. Refresh danh sách
   */
  const handleSubmit = async (values) => {
    setActionLoading(true);
    try {
      if (modalType === "create") {
        // TẠO BLOG MỚI
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
          status: "DRAFT", // Tạo dưới dạng nháp
        });
        if (response.data) {
          showNotification("Bài viết đã được lưu dưới dạng nháp!", "success");
          setIsModalVisible(false);
          form.resetFields();
          fetchMyBlogs(currentUser.id);
        }
              } else if (modalType === "edit") {
          // SỬA BLOG
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
          status: "DRAFT", // Lưu dưới dạng nháp
        };
        await blogService.updateBlog(selectedBlog.id, updatedBlogData);
        showNotification("Bài viết đã được lưu dưới dạng nháp!", "success");
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

  /**
   * 📤 HANDLE SEND FOR REVIEW - GỬI BÀI VIẾT ĐI DUYỆT
   * 
   * Workflow:
   * 1. Validate user info
   * 2. Gọi API submitBlog để gửi duyệt
   * 3. Hiển thị notification
   * 4. Refresh danh sách
   */
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

  /**
   * 🔍 HANDLE SEARCH - XỬ LÝ TÌM KIẾM
   * 
   * @param {string} value - Text tìm kiếm
   */
  const handleSearch = (value) => {
    setSearchText(value);
  };

  /**
   * 📁 HANDLE SELECT FILE - XỬ LÝ CHỌN FILE ẢNH
   * 
   * Quy trình:
   * 1. Validate file type (chỉ cho phép image)
   * 2. Kiểm tra kích thước file (giới hạn 5MB)
   * 3. Compress ảnh tự động
   * 4. Tạo preview
   * 
   * @param {Event} e - File input event
   */
  const handleSelectFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // KIỂM TRA LOẠI FILE
      if (!file.type.startsWith("image/")) {
        showNotification(
          error?.response?.data?.message || "Vui lòng chọn file ảnh",
          "error"
        );
        return;
      }

      // KIỂM TRA KÍCH THƯỚC FILE (GIỚI HẠN 1MB CHO BACKEND)
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

      // LUÔN COMPRESS ĐỂ ĐẢM BẢO FILE NHỎ HƠN 1MB
      let compressedFile = await compressImage(file);

      // KIỂM TRA LẠI SAU KHI COMPRESS
      if (compressedFile.size > maxSize) {
        showNotification(
          error?.response?.data?.message ||
            "File vẫn quá lớn sau khi nén. Vui lòng chọn file nhỏ hơn.",
          "error"
        );
        return;
      }

      setSelectedFile(compressedFile);

      // TẠO PREVIEW
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

  /**
   * 🗜️ COMPRESS IMAGE - NÉN ẢNH TỰ ĐỘNG
   * 
   * Quy trình:
   * 1. Tạo canvas để resize ảnh
   * 2. Giảm kích thước xuống 600x400px
   * 3. Giảm quality xuống 60%
   * 4. Convert sang JPEG
   * 
   * @param {File} file - File ảnh gốc
   * @returns {Promise<File>} File ảnh đã nén
   */
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = document.createElement("img"); // Sử dụng document.createElement thay vì new Image()

        img.onload = () => {
          try {
            // TÍNH TOÁN KÍCH THƯỚC MỚI (GIỮ TỶ LỆ, GIẢM KÍCH THƯỚC)
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

            // VẼ IMAGE ĐÃ RESIZE
            ctx.drawImage(img, 0, 0, width, height);

            // CONVERT TO BLOB VỚI QUALITY THẤP HƠN (0.6 THAY VÌ 0.8)
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
              0.6 // Giảm quality để file nhỏ hơn
            );
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

  /**
   * ✅ HANDLE UPLOAD IMG - UPLOAD ẢNH LÊN SERVER
   * 
   * Workflow:
   * 1. Validate file và blog
   * 2. Gọi API uploadBlogImage
   * 3. Cập nhật blog với ảnh mới
   * 4. Refresh danh sách
   */
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

        // CẬP NHẬT BLOG VỚI ẢNH MỚI
        setSelectedBlog((prev) => ({
          ...prev,
          coverImageUrl: response.data.result.coverImageUrl,
        }));

        // REFRESH DANH SÁCH BLOGS
        fetchMyBlogs(currentUser.id);
      } else {
        showNotification("Upload ảnh thất bại", "error");
      }

      // RESET TRẠNG THÁI
      setSelectedFile(null);
      setIsUploadModalOpen(false);
      setPreview(null);
    } catch (error) {
      console.error("Upload error:", error);

      // 🚨 XỬ LÝ CÁC LOẠI LỖI KHÁC NHAU
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

  // TABLE COLUMNS CONFIGURATION - CẤU HÌNH CỘT BẢNG
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
          <Space wrap>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => viewBlog(record)}
            >
              Xem
            </Button>

            {/* 🖼️ NÚT UPLOAD ẢNH */}
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
          <Space wrap>
            {/* ✏️ NÚT SỬA BLOG */}
            <Button
              size="small"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedBlog(record);
                setModalType("edit");
                form.setFieldsValue({
                  title: record.title,
                  content: record.content,
                  sourceReference: record.sourceReference,
                  featured: record.featured || false,
                });
                setIsModalVisible(true);
              }}
              loading={actionLoading}
            >
              Sửa
            </Button>
          </Space>
        </Space>
      ),
    },
  ];

  return (
    <Card className="blog-management-card">
      {/* 🔍 FILTER & SEARCH SECTION */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          {/* 🆕 NÚT TẠO BLOG */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateBlog}
          >
            Tạo Blog
          </Button>
          {/* 📊 STATUS FILTER */}
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
          {/* 🔍 SEARCH INPUT */}
          <Search
            placeholder="Tìm kiếm bài viết..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 200 }}
          />
        </div>
      </div>

      {/* 📋 BLOG TABLE */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading || actionLoading}
        pagination={false}
        scroll={{ x: 1000 }}
      />
      
      {/* 📄 CUSTOM PAGINATION */}
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

      {/* 👁️ VIEW/EDIT BLOG MODAL */}
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
                // CHỈ HIỂN THỊ NÚT GỬI DUYỆT CHO EDIT DRAFT
                ...(modalType === "edit" && selectedBlog?.status === "DRAFT" ? [
                  <Button
                    key="submitReview"
                    type="primary"
                    onClick={handleSendForReview}
                    loading={actionLoading}
                  >
                    Gửi duyệt
                  </Button>
                ] : [])
              ]
        }
        width={800}
        destroyOnHidden
      >
        {modalType === "view" ? (
          // VIEW BLOG CONTENT
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
          // CREATE/EDIT BLOG FORM
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

      {/* 🖼️ MODAL UPLOAD ẢNH CHO BLOG */}
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
    </Card>
  );
};

export default DoctorBlogManagement;
