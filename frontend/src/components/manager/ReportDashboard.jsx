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
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalRevenueThisMonth: null,
    totalCustomersTreated: 0,
  });

  const [topServices, setTopServices] = useState([]);
  const { showNotification } = useContext(NotificationContext);
  const [chartData, setChartData] = useState([]);
  const [yAxisUnit, setYAxisUnit] = useState("VNĐ");
  const [yAxisDivider, setYAxisDivider] = useState(1);
  useEffect(() => {
    const renderData = async () => {
      try {
        const res1 = await managerService.getManagerStatistic();
        const res2 = await managerService.getManagerChart();
        const res3 = await managerService.getManagerDashboardService();

        if (res1?.data?.result) {
          setStatistics({
            totalRevenue: res1.data.result.totalRevenue ?? 0,
            totalRevenueThisMonth:
              res1.data.result.totalRevenueThisMonth ?? null,
            totalCustomersTreated: res1.data.result.totalCustomersTreated ?? 0,
          });
        }

        if (res2?.data?.result) {
          const parsedChartData = res2.data.result.map((item) => {
            const monthNumber = new Date(item.month + "-01").getMonth() + 1; // fix để parse từ YYYY-MM
            return {
              month: `T${monthNumber}`,
              revenue: Number(item.totalRevenue),
            };
          });

          setChartData(parsedChartData);

          const maxRevenue = Math.max(
            0,
            ...parsedChartData.map((d) => d.revenue)
          );
          const { unit, divider } = getYAxisUnit(maxRevenue);

          setYAxisUnit(unit);
          setYAxisDivider(divider);
        }

        if (res3?.data?.result) {
          const totalRevenueAllServices = res3.data.result.reduce(
            (acc, item) => acc + (item.totalRevenue ?? 0), // xử lý null
            0
          );

          const formattedServices = res3.data.result.map((item, index) => ({
            key: index,
            name: item.serviceName,
            totalRecords: item.totalRecords,
            totalSuccessfulPayments: item.totalSuccessfulPayments,
            totalRevenue: item.totalRevenue ?? 0,
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

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return "0 VNĐ";
    return Number(value).toLocaleString("vi-VN") + " VNĐ";
  };

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
      render: (value) => formatCurrency(value),
    },
  ];

  const getYAxisUnit = (max) => {
    if (max >= 1_000_000_000) {
      return { unit: "tỷ", divider: 1_000_000_000 };
    }
    if (max >= 1_000_000) {
      return { unit: "triệu", divider: 1_000_000 };
    }
    if (max >= 1_000) {
      return { unit: "nghìn", divider: 1_000 };
    }
    return { unit: "VNĐ", divider: 1 }; // fallback
  };

  if (!statistics) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" tip="Đang tải dữ liệu thống kê..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng Doanh Thu"
              value={statistics.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "green" }}
              formatter={formatCurrency}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Doanh Thu Tháng Này"
              value={statistics.totalRevenueThisMonth}
              prefix={<RiseOutlined />}
              valueStyle={{ color: "orange" }}
              formatter={(value) =>
                value != null ? formatCurrency(value) : "Chưa có"
              }
            />
          </Card>
        </Col>
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

      {/* Row 2: Biểu đồ */}
      <Row style={{ marginTop: 32 }}>
        <Col span={24}>
          <Card title="Biểu Đồ Doanh Thu Theo Từng Tháng">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) =>
                    `${(value / yAxisDivider).toLocaleString(
                      "vi-VN"
                    )} ${yAxisUnit}`
                  }
                />

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
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke="#8884d8"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Bảng Top Dịch Vụ */}
      <Row style={{ marginTop: 32 }}>
        <Col span={24}>
          <Card title="Doanh thu theo dịch vụ">
            <Table
              columns={serviceColumns}
              dataSource={topServices}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportDashboard;
