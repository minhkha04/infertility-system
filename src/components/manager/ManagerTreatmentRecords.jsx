import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Descriptions,
  Row,
  Col,
  Input,
  Select,
  Typography,
  notification,
  Spin,
  Collapse,
  Statistic,
} from "antd";
import {
  UserOutlined,
  EyeOutlined,
  DownOutlined,
  UpOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  CheckOutlined,
  CloseOutlined,
  UserAddOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { treatmentService } from "../../service/treatment.service";
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const ManagerTreatmentRecords = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // backend page = 0-based
  const [totalPages, setTotalPages] = useState(1);
  const [treatmentRecords, setTreatmentRecords] = useState(1);

  const [stats, setStats] = useState({
    totalRecords: 0,
    pendingRecords: 0,
    inProgressRecords: 0,
    completedRecords: 0,
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async (page = 0) => {
    try {
      setLoading(true);

      // Sử dụng API mới v1/treatment-records với fallback

      const result = await treatmentService.getTreatmentRecords({
        page,
        size: 5,
      });

      console.log("📋 Treatment Records API response:", result);

      // Đảm bảo result là array từ content
      if (result?.data?.result?.content) {
        setTreatmentRecords(result.data.result.content);
      }
      setTotalPages(result.data.result.totalPages);
      setCurrentPage(page);

      console.log("📋 Processed Treatment Records:", treatmentRecords);

      if (treatmentRecords && treatmentRecords.length > 0) {
        // Nhóm các records theo customerName thay vì customerId
        const groupedByCustomer = treatmentRecords.reduce((acc, record) => {
          const customerName = record.customerName;
          if (!acc[customerName]) {
            acc[customerName] = [];
          }
          acc[customerName].push(record);
          return acc;
        }, {});

        // Chuyển đổi thành mảng và sắp xếp
        const formattedRecords = Object.entries(groupedByCustomer).map(
          ([customerName, treatments]) => {
            // Sắp xếp treatments theo ngày bắt đầu mới nhất
            const sortedTreatments = treatments.sort(
              (a, b) =>
                new Date(b.startDate || b.createdDate) -
                new Date(a.startDate || a.createdDate)
            );

            return {
              key: customerName, // Sử dụng customerName làm key
              customerId: sortedTreatments[0].customerId, // Lấy customerId từ treatment đầu tiên
              customerName: customerName,
              treatments: sortedTreatments.map((treatment) => ({
                ...treatment,
                key: treatment.id,
              })),
            };
          }
        );

        console.log("✅ Formatted Records:", formattedRecords);
        setRecords(formattedRecords);

        // Calculate statistics
        const totalRecords = treatmentRecords.length;
        const pendingRecords = treatmentRecords.filter(
          (r) => r.status === "PENDING"
        ).length;
        const inProgressRecords = treatmentRecords.filter(
          (r) => r.status === "INPROGRESS"
        ).length;
        const completedRecords = treatmentRecords.filter(
          (r) => r.status === "COMPLETED"
        ).length;

        setStats({
          totalRecords,
          pendingRecords,
          inProgressRecords,
          completedRecords,
        });
      } else {
        console.log("⚠️ No treatment records found");
        setRecords([]);
        setStats({
          totalRecords: 0,
          pendingRecords: 0,
          inProgressRecords: 0,
          completedRecords: 0,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching records:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể lấy danh sách điều trị",
      });
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      PENDING: { color: "orange", text: "Đang chờ xử lý" },
      INPROGRESS: { color: "blue", text: "Đang điều trị" },
      CANCELLED: { color: "red", text: "Đã hủy" },
      COMPLETED: { color: "green", text: "Hoàn thành" },
    };
    return (
      <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
    );
  };

  const viewRecord = (record) => {
    navigate("/manager/treatment-stages-view", {
      state: {
        patientInfo: {
          customerId: record.customerId,
          customerName: record.customerName,
        },
        treatmentData: record,
        sourcePage: "manager-treatment-records",
      },
    });
  };

  const handleApprove = async (treatment) => {
    try {
      const response = await treatmentService.updateTreatmentStatus(
        treatment.id,
        "INPROGRESS"
      );
      if (response?.data?.code === 1000) {
        notification.success({
          message: "Duyệt hồ sơ thành công!",
          description: `Hồ sơ của bệnh nhân ${treatment.customerName} đã chuyển sang trạng thái 'Đang điều trị'.`,
        });
        // Refresh the list
        fetchRecords();
      } else {
        notification.error({
          message: "Duyệt hồ sơ thất bại!",
          description:
            response?.data?.message ||
            "Không thể duyệt hồ sơ, vui lòng thử lại.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi khi duyệt hồ sơ!",
        description: error.message || "Đã xảy ra lỗi, vui lòng thử lại.",
      });
    }
  };

  const handleCancel = async (treatment) => {
    try {
      const response = await treatmentService.updateTreatmentStatus(
        treatment.id,
        "CANCELLED"
      );
      if (response?.data?.code === 1000) {
        notification.success({
          message: "Hủy hồ sơ thành công!",
          description: `Hồ sơ của bệnh nhân ${treatment.customerName} đã được hủy.`,
        });
        // Refresh the list
        fetchRecords();
      } else {
        notification.error({
          message: "Hủy hồ sơ thất bại!",
          description:
            response?.data?.message || "Không thể hủy hồ sơ, vui lòng thử lại.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi khi hủy hồ sơ!",
        description: error.message || "Đã xảy ra lỗi, vui lòng thử lại.",
      });
    }
  };

  const expandedRowRender = (record) => {
    const columns = [
      {
        title: "Dịch vụ",
        dataIndex: "treatmentServiceName",
        key: "treatmentServiceName",
        render: (text, treatment) => {
          // Lấy tên dịch vụ từ nhiều trường khác nhau
          const serviceName =
            treatment.treatmentServiceName ||
            treatment.serviceName ||
            treatment.name ||
            treatment.treatmentService?.name ||
            "Chưa có thông tin";

          return (
            <div
              style={{
                padding: "12px",
                background: "#f8f9fa",
                borderRadius: "6px",
                border: "1px solid #e9ecef",
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <Text strong style={{ fontSize: "14px", color: "#2c3e50" }}>
                  {serviceName}
                </Text>
              </div>
              {treatment.treatmentServiceDescription && (
                <div style={{ marginBottom: "4px" }}>
                  <Text style={{ fontSize: "12px", color: "#6c757d" }}>
                    {treatment.treatmentServiceDescription}
                  </Text>
                </div>
              )}
              {treatment.price && (
                <div>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#28a745",
                      fontWeight: "500",
                    }}
                  >
                    {treatment.price.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: "Bác sĩ",
        dataIndex: "doctorName",
        key: "doctorName",
        render: (text, treatment) => (
          <div
            style={{
              padding: "12px",
              background: "#f8f9fa",
              borderRadius: "6px",
              border: "1px solid #e9ecef",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              <Text strong style={{ fontSize: "14px", color: "#2c3e50" }}>
                {text || "Chưa có thông tin"}
              </Text>
            </div>
            {treatment.doctorEmail && (
              <div style={{ marginBottom: "4px" }}>
                <Text style={{ fontSize: "12px", color: "#6c757d" }}>
                  {treatment.doctorEmail}
                </Text>
              </div>
            )}
            {treatment.doctorPhone && (
              <div>
                <Text style={{ fontSize: "12px", color: "#6c757d" }}>
                  {treatment.doctorPhone}
                </Text>
              </div>
            )}
          </div>
        ),
      },
      {
        title: "Thời gian",
        dataIndex: "startDate",
        key: "startDate",
        render: (date, treatment) => (
          <div
            style={{
              padding: "12px",
              background: "#f8f9fa",
              borderRadius: "6px",
              border: "1px solid #e9ecef",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              <Text strong style={{ fontSize: "14px", color: "#2c3e50" }}>
                {dayjs(date).format("DD/MM/YYYY")}
              </Text>
            </div>
            {treatment.endDate && (
              <div style={{ marginBottom: "4px" }}>
                <Text style={{ fontSize: "12px", color: "#6c757d" }}>
                  Kết thúc: {dayjs(treatment.endDate).format("DD/MM/YYYY")}
                </Text>
              </div>
            )}
            {treatment.createdDate && (
              <div>
                <Text style={{ fontSize: "12px", color: "#6c757d" }}>
                  Tạo: {dayjs(treatment.createdDate).format("DD/MM/YYYY")}
                </Text>
              </div>
            )}
          </div>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status, treatment) => (
          <div
            style={{
              padding: "12px",
              background: "#f8f9fa",
              borderRadius: "6px",
              border: "1px solid #e9ecef",
            }}
          >
            <div style={{ marginBottom: "8px", textAlign: "center" }}>
              {getStatusTag(status)}
            </div>
            {treatment.notes && (
              <div style={{ textAlign: "center" }}>
                <Text style={{ fontSize: "12px", color: "#6c757d" }}>
                  {treatment.notes}
                </Text>
              </div>
            )}
          </div>
        ),
      },
      {
        title: "Thao tác",
        key: "action",
        render: (_, treatment) => (
          <div
            style={{
              padding: "12px",
              background: "#f8f9fa",
              borderRadius: "6px",
              border: "1px solid #e9ecef",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => viewRecord(treatment)}
                style={{ width: "100%" }}
              >
                Xem chi tiết
              </Button>
            </div>
            {treatment.status === "PENDING" && (
              <div>
                <div style={{ marginBottom: "4px" }}>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    size="small"
                    onClick={() => handleApprove(treatment)}
                    style={{
                      width: "100%",
                      background: "#28a745",
                      borderColor: "#28a745",
                    }}
                  >
                    Duyệt
                  </Button>
                </div>
                <div>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    size="small"
                    onClick={() => handleCancel(treatment)}
                    style={{ width: "100%" }}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            )}
          </div>
        ),
      },
    ];

    return (
      <div
        style={{
          padding: "16px",
          background: "#ffffff",
          borderRadius: "8px",
          margin: "8px 0",
          border: "1px solid #dee2e6",
        }}
      >
        <Table
          columns={columns}
          dataSource={record.treatments}
          pagination={false}
          size="small"
          style={{ background: "transparent" }}
        />
      </div>
    );
  };

  const columns = [
    {
      title: "Bệnh nhân",
      dataIndex: "customerName",
      key: "customerName",
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: "#1890ff" }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Hồ sơ mới nhất",
      dataIndex: "treatments",
      key: "latestTreatment",
      render: (treatments) => {
        const latest = treatments[0];
        return (
          <Space direction="vertical" size="small">
            <Text strong>{latest.treatmentServiceName}</Text>
            <Text type="secondary">{latest.doctorName}</Text>
            <Text type="secondary">
              {dayjs(latest.startDate || latest.createdDate).format(
                "DD/MM/YYYY"
              )}
            </Text>
          </Space>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "treatments",
      key: "status",
      render: (treatments) => {
        const latest = treatments[0];
        return getStatusTag(latest.status);
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => viewRecord(record.treatments[0])}
          >
            Xem chi tiết
          </Button>
          <Button
            icon={
              expandedRows.includes(record.key) ? (
                <UpOutlined />
              ) : (
                <DownOutlined />
              )
            }
            onClick={() => {
              if (expandedRows.includes(record.key)) {
                setExpandedRows(
                  expandedRows.filter((key) => key !== record.key)
                );
              } else {
                setExpandedRows([...expandedRows, record.key]);
              }
            }}
          >
            {expandedRows.includes(record.key) ? "Thu gọn" : "Mở rộng"}
          </Button>
        </Space>
      ),
    },
  ];

  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.customerName
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      record.treatments.some((treatment) => treatment.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Statistics Section */}
      <Row gutter={24} style={{ marginBottom: 10 }}>
        <Col span={6}>
          <Card
            variant="bordered"
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(24,144,255,0.08)",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "#1890ff", fontWeight: 600 }}>
                  Tổng hồ sơ điều trị
                </span>
              }
              value={stats.totalRecords}
              prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            variant="bordered"
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(24,144,255,0.08)",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "#faad14", fontWeight: 600 }}>
                  Chờ xử lý
                </span>
              }
              value={stats.pendingRecords}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            variant="bordered"
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(24,144,255,0.08)",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "#1890ff", fontWeight: 600 }}>
                  Đang điều trị
                </span>
              }
              value={stats.inProgressRecords}
              prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            variant="bordered"
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(24,144,255,0.08)",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "#52c41a", fontWeight: 600 }}>
                  Hoàn thành
                </span>
              }
              value={stats.completedRecords}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ fontSize: 28 }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="Tìm kiếm theo tên bệnh nhân..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 300 }}
          />
          <Select
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "PENDING", label: "Chờ xử lý" },
              { value: "INPROGRESS", label: "Đang điều trị" },
              { value: "COMPLETED", label: "Hoàn thành" },
              { value: "CANCELLED", label: "Đã hủy" },
            ]}
          />
          <Button
            onClick={() => {
              setSearchText("");
              setStatusFilter("all");
            }}
          >
            Đặt lại
          </Button>
          <Button
            type="primary"
            onClick={fetchRecords}
            icon={<FileTextOutlined />}
          >
            Làm mới
          </Button>
        </Space>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredRecords}
            expandable={{
              expandedRowRender,
              expandedRowKeys: expandedRows,
              onExpand: (expanded, record) => {
                if (expanded) {
                  setExpandedRows([...expandedRows, record.key]);
                } else {
                  setExpandedRows(
                    expandedRows.filter((key) => key !== record.key)
                  );
                }
              },
            }}
            pagination={false}
          />
          <div className="flex justify-end mt-4">
            <Button
              disabled={currentPage === 0}
              onClick={() => fetchRecords(currentPage - 1)}
              className="mr-2"
            >
              Trang trước
            </Button>
            <span className="px-4 py-1 bg-gray-100 rounded text-sm">
              Trang {currentPage + 1} / {totalPages}
            </span>
            <Button
              disabled={currentPage + 1 >= totalPages}
              onClick={() => fetchRecords(currentPage + 1)}
              className="ml-2"
            >
              Trang tiếp
            </Button>
          </div>
        </Spin>
      </Card>
    </div>
  );
};

export default ManagerTreatmentRecords;
