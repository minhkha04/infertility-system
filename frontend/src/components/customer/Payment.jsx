import React, { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Typography,
  Statistic,
  Row,
  Col,
  Steps,
  Modal,
  Form,
  Radio,
  Input,
  Space,
  Divider,
  Descriptions,
  Alert,
  Tabs,
} from "antd";
import {
  DollarOutlined,
  CreditCardOutlined,
  BankOutlined,
  QrcodeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  FileTextOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import PaymentPage from "../../pages/PaymentPage";

const { Title, Text, Paragraph } = Typography;

const Payment = () => {
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [form] = Form.useForm();

  return <PaymentPage />;
};

export default Payment;
