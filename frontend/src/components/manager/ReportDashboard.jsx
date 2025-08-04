import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Table,
  Tag,
} from "antd";
import {
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { managerService } from "../../service/manager.service";
import { NotificationContext } from "../../App";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const { Option } = Select;
const { RangePicker } = DatePicker;

const ReportDashboard = () => {
  // ===== STATE MANAGEMENT =====
  // State quản lý dữ liệu statistics tổng quan
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,                      // Tổng doanh thu tất cả thời gian
    totalRevenueThisMonth: null,          // Doanh thu tháng này
    totalCustomersTreated: 0,             // Tổng số bệnh nhân đã điều trị
  });

  // State quản lý dữ liệu bảng và chart
  const [topServices, setTopServices] = useState([]);              // Danh sách dịch vụ và doanh thu
  const [chartData, setChartData] = useState([]);                  // Dữ liệu cho chart doanh thu theo tháng
  const [yAxisUnit, setYAxisUnit] = useState("VNĐ");               // Đơn vị hiển thị trên Y axis
  const [yAxisDivider, setYAxisDivider] = useState(1);             // Số chia để convert đơn vị

  // ===== CONTEXT =====
  const { showNotification } = useContext(NotificationContext);    // Context hiển thị thông báo

  // ===== USEEFFECT: TẢI TẤT CẢ DỮ LIỆU DASHBOARD =====
  // useEffect này chạy khi component mount để tải tất cả data cho dashboard
  useEffect(() => {
    const renderData = async () => {
      try {
        // Gọi song song 3 APIs để lấy data
        const res1 = await managerService.getManagerStatistic();      // Statistics tổng quan
        const res2 = await managerService.getManagerChart();          // Data cho chart
        const res3 = await managerService.getManagerDashboardService(); // Data dịch vụ

        // ===== XỬ LÝ STATISTICS DATA =====
        // Parse và set statistics từ API response
        if (res1?.data?.result) {
          setStatistics({
            totalRevenue: res1.data.result.totalRevenue ?? 0,
            totalRevenueThisMonth:
              res1.data.result.totalRevenueThisMonth ?? null,
            totalCustomersTreated: res1.data.result.totalCustomersTreated ?? 0,
          });
        }

        // ===== XỬ LÝ CHART DATA =====
        // Parse data cho line chart doanh thu theo tháng
        if (res2?.data?.result) {
          const parsedChartData = res2.data.result.map((item) => {
            const monthNumber = new Date(item.month + "-01").getMonth() + 1; // Parse từ YYYY-MM format
            return {
              month: `Tháng ${monthNumber}`,
              revenue: Number(item.totalRevenue),
            };
          });

          setChartData(parsedChartData);

          // Tính toán đơn vị hiển thị cho Y axis dựa trên max revenue
          const maxRevenue = Math.max(
            0,
            ...parsedChartData.map((d) => d.revenue)
          );
          const { unit, divider } = getYAxisUnit(maxRevenue);

          setYAxisUnit(unit);
          setYAxisDivider(divider);
        }

        // ===== XỬ LÝ SERVICES DATA =====
        // Parse data cho bảng doanh thu theo dịch vụ
        if (res3?.data?.result) {
          const totalRevenueAllServices = res3.data.result.reduce(
            (acc, item) => acc + (item.totalRevenue ?? 0),             // Tính tổng doanh thu (xử lý null)
            0
          );

          const formattedServices = res3.data.result.map((item, index) => ({
            key: index,
            name: item.serviceName,                                    // Tên dịch vụ
            totalRecords: item.totalRecords,                           // Tổng số lượt
            totalSuccessfulPayments: item.totalSuccessfulPayments,     // Lượt thanh toán thành công
            totalRevenue: item.totalRevenue ?? 0,                     // Tổng doanh thu
          }));
          setTopServices(formattedServices);
        }
      } catch (error) {
        console.error(error);
        showNotification(error.response.data.message, "error");
      }
    };

    renderData();
  }, []);

  // ===== UTILITY FUNCTIONS =====
  
  // Hàm format số tiền thành VNĐ
  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return "0 VNĐ";
    return Number(value).toLocaleString("vi-VN") + " VNĐ";
  };

  // Hàm xác định đơn vị hiển thị cho Y axis dựa trên giá trị max
  const getYAxisUnit = (max) => {
    if (max >= 1_000_000_000) {
      return { unit: "tỷ", divider: 1_000_000_000 };                 // Tỷ VNĐ
    }
    if (max >= 1_000_000) {
      return { unit: "triệu", divider: 1_000_000 };                  // Triệu VNĐ
    }
    if (max >= 1_000) {
      return { unit: "nghìn", divider: 1_000 };                      // Nghìn VNĐ
    }
    return { unit: "VNĐ", divider: 1 };                              // VNĐ (fallback)
  };

  // ===== TABLE COLUMNS CONFIGURATION =====
  // Cấu hình các columns cho bảng doanh thu theo dịch vụ
  const serviceColumns = [
    {
      title: "Dịch vụ",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Tổng số lượt",
      dataIndex: "totalRecords",
      key: "totalRecords",
    },
    {
      title: "Lượt thanh toán thành công",
      dataIndex: "totalSuccessfulPayments",
      key: "totalSuccessfulPayments",
    },
    {
      title: "Tổng doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (value) => formatCurrency(value),                       // Format currency
    },
  ];

  // ===== LOADING STATE =====
  // Hiển thị loading khi chưa có data statistics
  if (!statistics) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" tip="Đang tải dữ liệu thống kê..." />
      </div>
    );
  }

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div style={{ padding: 24 }}>
      {/* ===== ROW 1: STATISTICS CARDS ===== */}
      {/* 3 cards hiển thị statistics tổng quan */}
      <Row gutter={16}>
        {/* Tổng doanh thu */}
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng Doanh Thu"
              value={statistics.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "green" }}
              formatter={formatCurrency}                              // Custom formatter
            />
          </Card>
        </Col>
        
        {/* Doanh thu tháng này */}
        <Col span={8}>
          <Card>
            <Statistic
              title="Doanh Thu Tháng Này"
              value={statistics.totalRevenueThisMonth}
              prefix={<RiseOutlined />}
              valueStyle={{ color: "orange" }}
              formatter={(value) =>                                   // Custom formatter với null check
                value != null ? formatCurrency(value) : "Chưa có"
              }
            />
          </Card>
        </Col>
        
        {/* Số bệnh nhân đã điều trị */}
        <Col span={8}>
          <Card>
            <Statistic
              title="Bệnh Nhân"
              value={statistics.totalCustomersTreated}
              prefix={<UserOutlined />}
              valueStyle={{ color: "red" }}
            />
          </Card>
        </Col>
      </Row>

      {/* ===== ROW 2: REVENUE CHART ===== */}
      {/* Line chart hiển thị doanh thu theo từng tháng */}
      <Row style={{ marginTop: 32 }}>
        <Col span={24}>
          <Card title="Biểu Đồ Doanh Thu Theo Từng Tháng">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}                                     // Data từ API
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />                            {/* X axis: tháng */}
                <YAxis
                  tickFormatter={(value) =>                         // Format Y axis với đơn vị động
                    `${(value / yAxisDivider).toLocaleString(
                      "vi-VN"
                    )} ${yAxisUnit}`
                  }
                />

                {/* Custom tooltip hiển thị chi tiết khi hover */}
                <Tooltip
                  content={({ payload, label }) => {
                    if (!payload || !payload.length) return null;

                    return (
                      <div
                        style={{
                          background: "white",
                          border: "1px solid #ccc",
                          padding: 10,
                        }}
                      >
                        <p>
                          <strong>{label}</strong>
                        </p>
                        {payload.map((entry, index) => (
                          <p
                            key={index}
                            style={{ color: entry.color, margin: 0 }}
                          >
                            {entry.name}: {entry.value.toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />

                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"                                  // Key trong data object
                  name="Doanh thu"                                   // Label hiển thị
                  stroke="#8884d8"                                   // Màu line
                  strokeWidth={3}
                  dot={{ r: 4 }}                                    // Style dots
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ===== ROW 3: SERVICES REVENUE TABLE ===== */}
      {/* Bảng hiển thị doanh thu theo từng dịch vụ */}
      <Row style={{ marginTop: 32 }}>
        <Col span={24}>
          <Card title="Doanh thu theo dịch vụ">
            <Table
              columns={serviceColumns}                              // Columns configuration
              dataSource={topServices}                             // Data từ API
              pagination={false}                                    // Disable pagination
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default ReportDashboard;
