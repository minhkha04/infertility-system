import React, { useState, useEffect, useContext, useLayoutEffect } from "react";
import {
  Typography,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Radio,
  Divider,
  Space,
  Row,
  Col,
  Card,
  Checkbox,
  TimePicker,
  Spin,
  Alert,
  List,
  Avatar,
  Descriptions,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  MedicineBoxOutlined,
  IdcardOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import UserFooter from "../components/UserFooter";
import { authService } from "../service/auth.service";
import { serviceService } from "../service/service.service";
import { doctorService } from "../service/doctor.service";
import { treatmentService } from "../service/treatment.service";
import { getLocgetlStorage } from "../utils/util";
import dayjs from "dayjs";
import { NotificationContext } from "../App";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Add this helper function at the top of the file, outside the component
function removeIncompleteWarning() {
  // Target all possible alert elements
  const alerts = document.querySelectorAll(
    '.ant-alert, .ant-message-notice, [role="alert"]'
  );

  alerts.forEach((alert) => {
    if (alert && alert.textContent) {
      const text = alert.textContent.toLowerCase();
      if (
        text.includes("incomplete treatment") ||
        text.includes("please complete it") ||
        text.includes("before registering")
      ) {
        // If it's a direct element, remove it
        if (alert.parentNode) {
          alert.parentNode.removeChild(alert);
        }

        // If it's in a container, try to find the container and remove it
        let parent = alert;
        for (let i = 0; i < 5; i++) {
          // Check up to 5 levels up
          parent = parent.parentNode;
          if (
            parent &&
            (parent.classList.contains("ant-message") ||
              parent.classList.contains("ant-alert-wrapper") ||
              parent.classList.contains("ant-notification"))
          ) {
            parent.style.display = "none";
            break;
          }
        }
      }
    }
  });
}

const MONTHS_VI = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const RegisterService = () => {
  const { showNotification } = useContext(NotificationContext);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userInfoLoading, setUserInfoLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorSchedule, setShowDoctorSchedule] = useState(false);
  const location = useLocation();
  const token = useSelector((state) => state.authSlice.token);
  const [currentUser, setCurrentUser] = useState(null);

  // API data states
  const [treatmentServices, setTreatmentServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  // Get the selected doctor from navigation state if available
  const initialSelectedDoctor = location.state?.selectedDoctor || null;
  const doctorName = location.state?.doctorName || null;
  const doctorRole = location.state?.doctorRole || null;
  const doctorSpecialization = location.state?.doctorSpecialization || null;
  const selectedService = location.state?.selectedService || null;

  // Additional state
  const [doctorNotAvailable, setDoctorNotAvailable] = useState(false);

  // Add new state for available doctors
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  // Add state to track unavailable doctor and newly selected doctor
  const [unavailableDoctor, setUnavailableDoctor] = useState(null);
  const [newlySelectedDoctor, setNewlySelectedDoctor] = useState(null);

  // Add state for doctor schedule
  const [doctorSchedule, setDoctorSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Always ignore incomplete treatment warning
  const [ignoreIncompleteWarning, setIgnoreIncompleteWarning] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(dayjs().month()); // Mặc định là tháng hiện tại

  // Thêm state để đảm bảo chỉ hiện thông báo một lần
  const [roleChecked, setRoleChecked] = useState(false);

  // Add more aggressive DOM cleanup on mount and for every render
  useEffect(() => {
    // Remove immediately
    removeIncompleteWarning();

    // Set up an interval to keep checking and removing the warning
    const intervalId = setInterval(removeIncompleteWarning, 100);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Add a MutationObserver to detect and remove the warning as soon as it's added to the DOM
  useEffect(() => {
    // Create a mutation observer to watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // If new nodes are added, check if they contain the warning
          removeIncompleteWarning();
        }
      }
    });

    // Start observing the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Clean up observer on unmount
    return () => observer.disconnect();
  }, []);

  // Add CSS to hide elements with the warning text
  useEffect(() => {
    // Create a style element
    const style = document.createElement("style");
    style.innerHTML = `
      [role="alert"]:has(*:contains('incomplete treatment')),
      [role="alert"]:has(*:contains('Please complete it')),
      .ant-alert:has(*:contains('incomplete treatment')),
      .ant-alert:has(*:contains('Please complete it')),
      .ant-message-notice:has(*:contains('incomplete treatment')),
      .ant-message-notice:has(*:contains('Please complete it')) {
        display: none !important;
      }
    `;

    // Add it to the document head
    document.head.appendChild(style);

    // Clean up on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Hide the incomplete treatment warning message that appears at the top of the page
  useEffect(() => {
    // Find and hide the warning element
    const hideWarningMessage = () => {
      const warningElements = document.querySelectorAll(
        ".ant-alert-warning, .ant-alert-error"
      );
      warningElements.forEach((element) => {
        if (
          element.textContent &&
          (element.textContent.includes("incomplete treatment") ||
            element.textContent.includes("Please complete it"))
        ) {
          element.style.display = "none";
        }
      });
    };

    // Run initially and set up interval to keep checking
    hideWarningMessage();
    const interval = setInterval(hideWarningMessage, 500);

    return () => clearInterval(interval);
  }, []);

  // Load user information when component mounts
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setUserInfoLoading(true);
        const token = getLocgetlStorage("token");

        if (token) {
          const response = await authService.getMyInfo(token);

          if (response.data && response.data.result) {
            const userInfo = response.data.result;
            setCurrentUser(userInfo);

            // Try different possible field names for firstName/lastName
            const firstName =
              userInfo.firstName ||
              userInfo.fname ||
              userInfo.first_name ||
              userInfo.fullName ||
              userInfo.name ||
              "";

            // Auto-fill user information
            form.setFieldsValue({
              firstName: firstName,
              email: userInfo.email || "",
              phone: userInfo.phone || userInfo.phoneNumber || "",
              dateOfBirth:
                userInfo.dateOfBirth || userInfo.dob
                  ? dayjs(userInfo.dateOfBirth || userInfo.dob)
                  : null,
              gender: userInfo.gender || "",
              address: userInfo.address || userInfo.fullAddress || "",
            });
          }
        }
      } catch (error) {
        // Silent error handling - don't show notification
      } finally {
        setUserInfoLoading(false);
      }
    };

    loadUserInfo();
    fetchTreatmentServices();
    fetchDoctors();
  }, [form]);

  // Fetch treatment services from API
  const fetchTreatmentServices = async () => {
    try {
      setServicesLoading(true);
      // Sử dụng API mới thay vì API cũ
      const response = await serviceService.getPublicServices({
        page: 0,
        size: 100,
      });

      if (
        response &&
        response.data &&
        response.data.result &&
        response.data.result.content
      ) {
        let servicesData = response.data.result.content;

        // Map API data to the format needed for Select options
        const mappedServices = servicesData.map((service) => ({
          value: service.id.toString(),
          label: `${
            service.serviceName || service.name
          } - ${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(service.price)}`,
          price: service.price,
        }));

        setTreatmentServices(mappedServices);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      // Silent error handling
    } finally {
      setServicesLoading(false);
    }
  };

  // Fetch doctors from API
  const fetchDoctors = async () => {
    try {
      setDoctorsLoading(true);
      const response = await doctorService.getAllDoctors(0, 100); // Get first 100 doctors

      if (
        response &&
        response.data &&
        response.data.result &&
        response.data.result.content
      ) {
        let doctorsData = response.data.result.content;

        // Map API data to the format needed for Select options
        const mappedDoctors = doctorsData.map((doctor) => ({
          value: doctor.id,
          label: `${doctor.fullName || "Bác sĩ"} - ${
            doctor.qualifications || "Chuyên khoa"
          }`,
          specialty: doctor.qualifications || "Chuyên khoa",
        }));

        // Add "No selection" option
        mappedDoctors.push({
          value: "",
          label: "Không chọn - Bác sĩ có sẵn",
          specialty: "Tổng quát",
        });

        setDoctors(mappedDoctors);
      } else {
        setDoctors([
          {
            value: "",
            label: "Không có bác sĩ nào - Vui lòng thử lại",
            specialty: "Tổng quát",
          },
        ]);
      }
    } catch (error) {
      setDoctors([
        {
          value: "",
          label: "Không thể tải danh sách bác sĩ - Vui lòng thử lại",
          specialty: "Tổng quát",
        },
      ]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  useEffect(() => {
    // If a doctor was selected from the doctor's page, set the form field and fetch their schedule
    if (initialSelectedDoctor) {
      // We need to call the same logic as onDoctorChange
      const fetchInitialDoctorSchedule = async (doctorId) => {
        if (!doctorId) return;

        // Set the selected doctor in state and form
        setSelectedDoctor(doctorId);
        form.setFieldsValue({ doctor: doctorId });

        // Show loading state for schedule
        setScheduleLoading(true);
        setDoctorSchedule(null);
        setShowDoctorSchedule(false);

        try {
          // Call API to get doctor schedule
          const response = await doctorService.getDoctorScheduleById(doctorId);

          if (response.data && response.data.result) {
            setDoctorSchedule(response.data.result);
            setShowDoctorSchedule(true);
          } else {
            // No schedule found or error
            setDoctorSchedule(null);
            setShowDoctorSchedule(false);
          }
        } catch (error) {
          // Handle error if schedule fetching fails
          setDoctorSchedule(null);
          setShowDoctorSchedule(false);
        } finally {
          setScheduleLoading(false);
        }
      };

      fetchInitialDoctorSchedule(initialSelectedDoctor);
    }

    // If a service was selected from the service detail page, set the form field
    if (selectedService) {
      form.setFieldsValue({
        treatmentService: selectedService.toString(),
      });
    }
  }, [initialSelectedDoctor, selectedService, form]);

  // Add function to check doctor availability
  const checkDoctorAvailability = async (date, shift) => {
    if (!date || !shift) return;

    try {
      setCheckingAvailability(true);

      // Format the date as YYYY-MM-DD
      const formattedDate = date.format("YYYY-MM-DD");

      // Convert shift to uppercase as required by API
      const formattedShift = shift.toUpperCase();

      // Call the API to get available doctors
      const response = await doctorService.getAvailableDoctors(
        formattedDate,
        formattedShift
      );

      if (response && response.data && response.data.result) {
        const availableDoctorsData = Array.isArray(response.data.result)
          ? response.data.result
          : [response.data.result];
        setAvailableDoctors(availableDoctorsData);
        setAvailabilityChecked(true);

        // Update the doctors dropdown with only available doctors
        const mappedAvailableDoctors = availableDoctorsData.map((doctor) => ({
          value: doctor.id,
          label: `${doctor.fullName || "Bác sĩ"} - ${
            doctor.qualifications || "Chuyên khoa"
          }`,
          specialty: doctor.qualifications || "Chuyên khoa",
        }));

        // If there's an initially selected doctor, make sure they're included
        if (
          initialSelectedDoctor &&
          !availableDoctorsData.find((d) => d.id === initialSelectedDoctor)
        ) {
          // Find the initially selected doctor from the original doctors list
          const originalDoctors = await fetchOriginalDoctors();
          const selectedDoctor = originalDoctors.find(
            (d) => d.value === initialSelectedDoctor
          );
          if (selectedDoctor) {
            mappedAvailableDoctors.unshift(selectedDoctor);
          }
        }

        // Add "No selection" option
        mappedAvailableDoctors.push({
          value: "",
          label: "Không chọn - Bác sĩ có sẵn",
          specialty: "Tổng quát",
        });

        // Update the doctors state with only available doctors
        setDoctors(mappedAvailableDoctors);
      } else {
        setAvailableDoctors([]);
        setAvailabilityChecked(true);

        // If no doctors available, show empty list with "No selection" option
        setDoctors([
          {
            value: "",
            label: "Không có bác sĩ có lịch trống - Vui lòng chọn ngày/ca khác",
            specialty: "Tổng quát",
          },
        ]);
      }
    } catch (error) {
      setAvailableDoctors([]);
      setAvailabilityChecked(true);

      // On error, show empty list with "No selection" option
      setDoctors([
        {
          value: "",
          label: "Không thể tải danh sách bác sĩ - Vui lòng thử lại",
          specialty: "Tổng quát",
        },
      ]);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Helper function to fetch original doctors list
  const fetchOriginalDoctors = async () => {
    try {
      const response = await doctorService.getAllDoctors(0, 100); // Get first 100 doctors

      if (
        response &&
        response.data &&
        response.data.result &&
        response.data.result.content
      ) {
        let doctorsData = response.data.result.content;

        // Map API data to the format needed for Select options
        const mappedDoctors = doctorsData.map((doctor) => ({
          value: doctor.id,
          label: `${doctor.fullName || "Bác sĩ"} - ${
            doctor.qualifications || "Chuyên khoa"
          }`,
          specialty: doctor.qualifications || "Chuyên khoa",
        }));

        return mappedDoctors;
      }
    } catch (error) {
      // Silent error handling
    }
    return [];
  };

  // Add effect to check availability when date or shift changes
  useEffect(() => {
    const appointmentDate = form.getFieldValue("appointmentDate");
    const shift = form.getFieldValue("shift");

    if (appointmentDate && shift) {
      checkDoctorAvailability(appointmentDate, shift);
    } else {
      setAvailabilityChecked(false);
      // Reset doctors list to original state when no date/shift selected
      fetchDoctors();
    }
  }, [form.getFieldValue("appointmentDate"), form.getFieldValue("shift")]);

  // Modify existing handlers to check availability
  const onDateChange = (date) => {
    const shift = form.getFieldValue("shift");
    if (date && shift) {
      checkDoctorAvailability(date, shift);
    } else {
      setAvailabilityChecked(false);
      // Reset doctors list to original state when no date/shift selected
      fetchDoctors();
    }
  };

  const onShiftChange = (value) => {
    const appointmentDate = form.getFieldValue("appointmentDate");
    if (appointmentDate && value) {
      checkDoctorAvailability(appointmentDate, value);
    } else {
      setAvailabilityChecked(false);
      // Reset doctors list to original state when no date/shift selected
      fetchDoctors();
    }
  };

  // Modify onDoctorChange to check if doctor is available
  const onDoctorChange = async (value) => {
    setSelectedDoctor(value);
    setDoctorNotAvailable(false);
    setAvailableDoctors([]);
    setAvailabilityChecked(false);

    if (!value || value === "") {
      form.setFieldsValue({ doctor: null });
      setShowDoctorSchedule(false);
      setDoctorSchedule(null);
      return;
    }

    // Nếu đã chọn ngày và ca thì không hiển thị lịch làm việc nữa
    const appointmentDate = form.getFieldValue("appointmentDate");
    const shift = form.getFieldValue("shift");
    if (appointmentDate && shift) {
      setShowDoctorSchedule(false);
      setDoctorSchedule(null);
      return;
    }

    // Nếu chưa chọn đủ ngày và ca thì mới hiển thị lịch làm việc
    setScheduleLoading(true);
    setDoctorSchedule(null);
    setShowDoctorSchedule(false);

    try {
      const response = await doctorService.getDoctorScheduleById(value);
      if (response.data && response.data.result) {
        setDoctorSchedule(response.data.result);
        setShowDoctorSchedule(true);
      } else {
        setDoctorSchedule(null);
        setShowDoctorSchedule(false);
      }
    } catch (error) {
      setDoctorSchedule(null);
      setShowDoctorSchedule(false);
    } finally {
      setScheduleLoading(false);
    }
  };

  // Function to handle schedule selection
  const handleScheduleSelection = (date, shift) => {
    form.setFieldsValue({
      appointmentDate: dayjs(date),
      shift: shift.toLowerCase(),
    });

    // Scroll lên phần "🗓 Thông tin Đặt lịch"
    setTimeout(() => {
      // Tìm element chứa text "Thông tin Đặt lịch"
      document.getElementById("appointment-section")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
  };

  // Add a more comprehensive error handler that also shows more info to the user in this scenario
  const onFinish = (values) => {
    setLoading(true);
    setDoctorNotAvailable(false); // Reset doctor status

    // Call the API to register treatment service
    const registerTreatment = async () => {
      try {
        // Kiểm tra đăng nhập và thông tin người dùng
        const token = getLocgetlStorage("token");

        console.log("Debug - currentUser:", currentUser);
        console.log("Debug - token:", token ? "Có token" : "Không có token");
        console.log("Debug - form values:", values);
        console.log("Debug - selectedDoctor:", selectedDoctor);
        console.log(
          "Debug - ignoreIncompleteWarning:",
          ignoreIncompleteWarning
        );

        // Kiểm tra xem token có tồn tại không (người dùng đã đăng nhập)
        if (!token) {
          setLoading(false);
          return;
        }

        // Kiểm tra xem có thông tin người dùng không
        if (!currentUser || !currentUser.id) {
          showNotification(
            "Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.",
            "error"
          );
          setLoading(false);
          return;
        }

        // Kiểm tra các trường bắt buộc
        const requiredFields = [
          {
            name: "firstName",
            message: "Vui lòng nhập họ tên",
            field: "firstName",
          },
          { name: "email", message: "Vui lòng nhập email", field: "email" },
          {
            name: "phone",
            message: "Vui lòng nhập số điện thoại",
            field: "phone",
          },
          {
            name: "dateOfBirth",
            message: "Vui lòng chọn ngày sinh",
            field: "dateOfBirth",
          },
          {
            name: "gender",
            message: "Vui lòng chọn giới tính",
            field: "gender",
          },
          {
            name: "address",
            message: "Vui lòng nhập địa chỉ",
            field: "address",
          },
          {
            name: "appointmentDate",
            message: "Vui lòng chọn ngày thăm khám",
            field: "appointmentDate",
          },
          { name: "shift", message: "Vui lòng chọn buổi khám", field: "shift" },
          {
            name: "treatmentService",
            message: "Vui lòng chọn dịch vụ điều trị",
            field: "treatmentService",
          },
        ];

        for (const field of requiredFields) {
          if (!values[field.name]) {
            showNotification(field.message, "error");
            form.scrollToField(field.field);
            setLoading(false);
            return;
          }
        }

        // Xử lý doctorId đúng định dạng - cho phép null để hệ thống tự chọn
        let doctorId = values.doctor;

        // Nếu doctorId là chuỗi rỗng hoặc null, gán null để hệ thống tự chọn
        if (!doctorId || doctorId === "") {
          doctorId = null;
        }
        // Nếu doctorId bắt đầu bằng "dr_", cắt bỏ tiền tố
        else if (typeof doctorId === "string" && doctorId.startsWith("dr_")) {
          doctorId = doctorId.substring(3);
        }

        console.log("Debug - final doctorId:", doctorId, typeof doctorId);

        // Create direct API payload - remove any unnecessary fields
        const registerData = {
          customerId: currentUser.id,
          doctorId: doctorId,
          treatmentServiceId: parseInt(values.treatmentService),
          startDate: values.appointmentDate.format("YYYY-MM-DD"),
          shift: values.shift.toUpperCase() || "MORNING",
        };

        // Only add optional fields if they have values
        if (values.cd1Date) {
          registerData.cd1Date = values.cd1Date.format("YYYY-MM-DD");
        }

        if (values.medicalHistory) {
          registerData.medicalHistory = values.medicalHistory;
        }

        console.log("Debug - simplified registerData:", registerData);

        // Validate required fields before sending
        if (!registerData.customerId) {
          showNotification("Thiếu thông tin khách hàng", "error");
          setLoading(false);
          return;
        }

        if (!registerData.treatmentServiceId) {
          showNotification("Vui lòng chọn dịch vụ điều trị", "error");
          setLoading(false);
          return;
        }

        if (!registerData.startDate) {
          showNotification("Vui lòng chọn ngày bắt đầu", "error");
          setLoading(false);
          return;
        }

        if (!registerData.shift) {
          showNotification("Vui lòng chọn ca khám", "error");
          setLoading(false);
          return;
        }

        console.log("🔍 Validated registerData:", registerData);

        // Add loader indicator
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
        }

        // Direct registration approach - show the user what's happening
        showNotification("Đang xử lý đăng ký...", "info");

        try {
          // Call the API directly - sử dụng API mới từ treatmentService
          const response = await treatmentService.registerTreatmentService(
            registerData
          );

          console.log("Debug - API response:", response);

          if (response && response.status >= 200 && response.status < 300) {
            // Hiển thị thông báo thành công
            showNotification("Đăng ký dịch vụ thành công!", "success");

            // Reset form và các state
            form.resetFields();
            setSelectedDoctor(null);
            setShowDoctorSchedule(false);
            setDoctorSchedule(null);
            setAvailableDoctors([]);
            setAvailabilityChecked(false);

            // Chuyển hướng đến trang customer-dashboard/treatment sau khi đăng ký thành công
            setTimeout(() => {
              navigate("/customer-dashboard/treatment", {
                state: {
                  registrationSuccess: true,
                  serviceName:
                    treatmentServices.find(
                      (s) => s.value === values.treatmentService
                    )?.label || "Dịch vụ",
                },
              });
            }, 2000);
          } else {
            throw new Error("Unexpected response");
          }
        } catch (apiError) {
          // Sử dụng message từ BE nếu có
          let errorMessage =
            "Đăng ký dịch vụ không thành công. Vui lòng thử lại sau.";
          if (
            apiError.response &&
            apiError.response.data &&
            apiError.response.data.message
          ) {
            errorMessage = apiError.response.data.message;
          }
          showNotification(errorMessage, "error");
          throw apiError;
        } finally {
          // Always re-enable the button
          if (submitButton) {
            submitButton.disabled = false;
          }
          setLoading(false);
        }
      } catch (err) {
        // Không hiển thị thông báo lỗi ở đây vì đã hiển thị ở trên
        // Re-enable submit button nếu cần
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = false;
        }
        setLoading(false);
      }
    };

    registerTreatment();
  };

  const isLoggedIn = !!token;

  // Thêm useEffect để kiểm tra lại khi currentUser thay đổi
  useEffect(() => {
    if (
      currentUser &&
      currentUser.roleName &&
      currentUser.roleName.name !== "CUSTOMER"
    ) {
      if (!roleChecked) {
        showNotification(
          "Bạn không có quyền đăng ký lịch hẹn. Chỉ khách hàng mới có thể sử dụng tính năng này.",
          "error"
        );
        setRoleChecked(true);
      }
      navigate("/");
    }
  }, [currentUser, navigate, showNotification, roleChecked]);

  // Kiểm tra role ngay khi component mount (từ localStorage)
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    if (userInfo.roleName && userInfo.roleName.name !== "CUSTOMER") {
      if (!roleChecked) {
        showNotification(
          "Bạn không có quyền đăng ký lịch hẹn. Chỉ khách hàng mới có thể sử dụng tính năng này.",
          "error"
        );
        setRoleChecked(true);
      }
      navigate("/");
    }
  }, [navigate, showNotification, roleChecked]);

  // Kiểm tra role khi token thay đổi
  useEffect(() => {
    if (token) {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      if (userInfo.roleName && userInfo.roleName.name !== "CUSTOMER") {
        if (!roleChecked) {
          showNotification(
            "Bạn không có quyền đăng ký lịch hẹn. Chỉ khách hàng mới có thể sử dụng tính năng này.",
            "error"
          );
          setRoleChecked(true);
        }
        navigate("/");
      }
    }
  }, [token, navigate, showNotification, roleChecked]);

  useEffect(() => {
    if (selectedService && treatmentServices.length > 0) {
      form.setFieldsValue({
        treatmentService: selectedService.toString(),
      });
    }
  }, [selectedService, treatmentServices, form]);

  return (
    <div className="min-h-screen">
      <UserHeader />

      {/* Hero Banner */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <img
          src="/images/features/pc8.jpg"
          alt="Băng rôn Đăng ký dịch vụ"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              Đăng Ký Dịch Vụ Điều Trị Hiếm Muộn
            </h1>
          </div>
        </div>
      </div>

      <div className="py-20" style={{ backgroundColor: "#f0f4f8" }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card
              className="shadow-lg"
              style={{ backgroundColor: "#fff", borderRadius: "8px" }}
            >
              {!isLoggedIn && (
                <Alert
                  message="Vui lòng đăng nhập để đăng ký dịch vụ"
                  type="warning"
                  showIcon
                  className="mb-4"
                />
              )}
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                scrollToFirstError
              >
                <Title level={3} className="mb-6" style={{ color: "#333" }}>
                  Thông tin Cá nhân
                  {userInfoLoading && (
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#1890ff",
                        marginLeft: "10px",
                      }}
                    >
                      Đang tải thông tin...
                    </span>
                  )}
                </Title>

                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="firstName"
                      label="Họ và Tên"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập họ và tên của bạn",
                        },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Họ và Tên"
                        size="large"
                        disabled={isLoggedIn}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập email của bạn",
                        },
                        {
                          type: "email",
                          message: "Vui lòng nhập email hợp lệ",
                        },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="Địa chỉ Email"
                        size="large"
                        disabled={isLoggedIn}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="phone"
                      label="Số điện thoại"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số điện thoại của bạn",
                        },
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder="Số điện thoại"
                        size="large"
                        disabled={isLoggedIn}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="dateOfBirth"
                      label="Ngày sinh"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn ngày sinh của bạn",
                        },
                      ]}
                    >
                      <DatePicker
                        className="w-full"
                        size="large"
                        placeholder="Chọn ngày sinh"
                        disabled={isLoggedIn}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="gender"
                      label="Giới tính"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn giới tính của bạn",
                        },
                      ]}
                    >
                      <Radio.Group disabled={isLoggedIn}>
                        <Radio value="female">Nữ</Radio>
                        <Radio value="male">Nam</Radio>
                        <Radio value="other">Khác</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="address"
                      label="Địa chỉ"
                      rules={[
                        { required: true, message: "Vui lòng nhập địa chỉ" },
                      ]}
                    >
                      <Input
                        prefix={<HomeOutlined />}
                        placeholder="Địa chỉ thường trú"
                        size="large"
                        disabled={isLoggedIn}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title
                  id="appointment-section"
                  level={3}
                  className="mb-6"
                  style={{ color: "#333" }}
                >
                  Thông tin Đặt lịch
                </Title>

                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="appointmentDate"
                      label="Ngày thăm khám ban đầu"
                      rules={[
                        { required: true, message: "Vui lòng chọn ngày khám" },
                      ]}
                    >
                      <DatePicker
                        className="w-full"
                        size="large"
                        placeholder="Chọn ngày khám"
                        disabledDate={(current) =>
                          current && current < dayjs().startOf("day")
                        }
                        onChange={onDateChange}
                      />
                    </Form.Item>
                    {doctorNotAvailable && (
                      <div className="text-red-500 text-sm mb-2">
                        <span>
                          Bác sĩ không có lịch trống vào ngày và ca này. Vui
                          lòng chọn ngày hoặc ca khác.
                        </span>
                      </div>
                    )}
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="shift"
                      label="Buổi khám"
                      rules={[
                        { required: true, message: "Vui lòng chọn buổi khám" },
                      ]}
                    >
                      <Select
                        placeholder="-- Chọn buổi khám --"
                        size="large"
                        onChange={onShiftChange}
                      >
                        <Option value="morning">Sáng (08:00–12:00)</Option>
                        <Option value="afternoon">Chiều (13:00–17:00)</Option>
                      </Select>
                    </Form.Item>
                    {doctorNotAvailable && (
                      <div className="text-blue-500 text-sm mb-2">
                        <span>
                          Gợi ý: Thử chọn buổi khám khác hoặc chọn "Không chọn -
                          Bác sĩ có sẵn" để hệ thống tự động phân bác sĩ có lịch
                          trống.
                        </span>
                      </div>
                    )}
                  </Col>
                </Row>

                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="cd1Date"
                      label="Ngày đầu chu kì"
                      tooltip="Thông tin quan trọng giúp bác sĩ lập kế hoạch điều trị hiệu quả"
                      rules={[
                        {
                          required: false,
                          message: "Vui lòng đầu chu kì nếu có",
                        },
                      ]}
                    >
                      <DatePicker
                        className="w-full"
                        size="large"
                        placeholder="Chọn ngày đầu chu kỳ"
                      />
                    </Form.Item>
                    <div className="text-gray-500 text-sm mt-1">
                      <i>
                        Thông tin này giúp bác sĩ xác định chu kỳ kinh nguyệt và
                        lập kế hoạch điều trị phù hợp
                      </i>
                    </div>
                  </Col>
                </Row>

                <Form.Item
                  name="treatmentService"
                  label="Gói dịch vụ điều trị"
                  rules={[
                    { required: true, message: "Vui lòng chọn gói dịch vụ" },
                  ]}
                >
                  {servicesLoading ? (
                    <div className="flex items-center">
                      <Spin size="small" className="mr-2" />
                      <span>Đang tải danh sách dịch vụ...</span>
                    </div>
                  ) : (
                    <Select placeholder="-- Chọn gói dịch vụ --" size="large">
                      {treatmentServices.map((service) => (
                        <Option key={service.value} value={service.value}>
                          {service.label}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>

                <Form.Item
                  name="doctor"
                  label={
                    initialSelectedDoctor
                      ? "Bác sĩ đã chọn"
                      : "Chỉ định bác sĩ điều trị (tùy chọn)"
                  }
                >
                  {initialSelectedDoctor ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded">
                      <Text strong className="text-green-700 text-lg">
                        {doctorName ||
                          doctors.find(
                            (doc) => doc.value === initialSelectedDoctor
                          )?.label ||
                          "Bác sĩ đã được chỉ định"}
                      </Text>

                      {doctorRole && (
                        <div className="mt-1 text-[#ff8460] font-medium">
                          {doctorRole}
                        </div>
                      )}

                      {doctorSpecialization && (
                        <div className="mt-1 text-gray-700">
                          {doctorSpecialization}
                        </div>
                      )}
                    </div>
                  ) : doctorsLoading ? (
                    <div className="flex items-center">
                      <Spin size="small" className="mr-2" />
                      <span>Đang tải danh sách bác sĩ...</span>
                    </div>
                  ) : (
                    <Select
                      placeholder="-- Không chọn (hệ thống tự phân bác sĩ) --"
                      size="large"
                      onChange={onDoctorChange}
                    >
                      {doctors.map((doctor) => (
                        <Option key={doctor.value} value={doctor.value}>
                          {doctor.label}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>

                {/* Doctor Schedule */}
                {showDoctorSchedule && doctorSchedule && (
                  <Card className="mb-4" style={{ backgroundColor: "#f9f9f9" }}>
                    <Title level={4}>Lịch làm việc của bác sĩ</Title>
                    <div className="mb-4 flex items-center gap-4">
                      <span>Xem lịch tháng:</span>
                      <Select
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        style={{ width: 120 }}
                      >
                        {MONTHS_VI.map((m, idx) => (
                          <Select.Option key={idx} value={idx}>
                            {m}
                          </Select.Option>
                        ))}
                      </Select>
                      <span>{dayjs().year()}</span>
                    </div>
                    {scheduleLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Spin size="large" />
                        <span className="ml-2">Đang tải lịch làm việc...</span>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: "#fff",
                          borderRadius: 16,
                          padding: 20,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          overflowX: "auto",
                        }}
                      >
                        {(() => {
                          const dates = Object.keys(
                            doctorSchedule.schedules || {}
                          ).sort();
                          const months = {};
                          dates.forEach((date) => {
                            const d = dayjs(date);
                            if (d.month() === selectedMonth) {
                              const monthKey = d.format("YYYY-MM");
                              if (!months[monthKey]) months[monthKey] = [];
                              months[monthKey].push(date);
                            }
                          });
                          return Object.entries(months).map(
                            ([monthKey, monthDates]) => {
                              const [year, month] = monthKey.split("-");
                              const monthName = dayjs(monthKey + "-01").format(
                                "MMMM YYYY"
                              );

                              // Generate calendar grid for this month
                              const firstDate = new Date(year, month - 1, 1);
                              const totalDays = new Date(
                                year,
                                month,
                                0
                              ).getDate();
                              const firstDay = firstDate.getDay(); // 0=Sunday, 1=Monday, etc.
                              const offset = firstDay === 0 ? 6 : firstDay - 1; // Convert to Monday = 0

                              const calendar = [];
                              let day = 1;
                              for (let i = 0; i < 6 && day <= totalDays; i++) {
                                const week = [];
                                for (let j = 0; j < 7; j++) {
                                  if (
                                    (i === 0 && j < offset) ||
                                    day > totalDays
                                  ) {
                                    week.push(null);
                                  } else {
                                    const dateStr = `${year}-${String(
                                      month
                                    ).padStart(2, "0")}-${String(day).padStart(
                                      2,
                                      "0"
                                    )}`;
                                    week.push(dateStr);
                                    day++;
                                  }
                                }
                                calendar.push(week);
                              }

                              return (
                                <div
                                  key={monthKey}
                                  style={{ marginBottom: 30 }}
                                >
                                  <table
                                    style={{
                                      width: "100%",
                                      borderCollapse: "separate",
                                      borderSpacing: 4,
                                      minWidth: 600,
                                    }}
                                  >
                                    <thead>
                                      <tr>
                                        <th
                                          style={{
                                            border: "none",
                                            padding: 12,
                                            background: "#f0f8ff",
                                            textAlign: "center",
                                            fontWeight: 700,
                                            fontSize: 14,
                                            color: "#1890ff",
                                            borderRadius: 8,
                                          }}
                                        >
                                          Thứ 2
                                        </th>
                                        <th
                                          style={{
                                            border: "none",
                                            padding: 12,
                                            background: "#f0f8ff",
                                            textAlign: "center",
                                            fontWeight: 700,
                                            fontSize: 14,
                                            color: "#1890ff",
                                            borderRadius: 8,
                                          }}
                                        >
                                          Thứ 3
                                        </th>
                                        <th
                                          style={{
                                            border: "none",
                                            padding: 12,
                                            background: "#f0f8ff",
                                            textAlign: "center",
                                            fontWeight: 700,
                                            fontSize: 14,
                                            color: "#1890ff",
                                            borderRadius: 8,
                                          }}
                                        >
                                          Thứ 4
                                        </th>
                                        <th
                                          style={{
                                            border: "none",
                                            padding: 12,
                                            background: "#f0f8ff",
                                            textAlign: "center",
                                            fontWeight: 700,
                                            fontSize: 14,
                                            color: "#1890ff",
                                            borderRadius: 8,
                                          }}
                                        >
                                          Thứ 5
                                        </th>
                                        <th
                                          style={{
                                            border: "none",
                                            padding: 12,
                                            background: "#f0f8ff",
                                            textAlign: "center",
                                            fontWeight: 700,
                                            fontSize: 14,
                                            color: "#1890ff",
                                            borderRadius: 8,
                                          }}
                                        >
                                          Thứ 6
                                        </th>
                                        <th
                                          style={{
                                            border: "none",
                                            padding: 12,
                                            background: "#f0f8ff",
                                            textAlign: "center",
                                            fontWeight: 700,
                                            fontSize: 14,
                                            color: "#1890ff",
                                            borderRadius: 8,
                                          }}
                                        >
                                          Thứ 7
                                        </th>
                                        <th
                                          style={{
                                            border: "none",
                                            padding: 12,
                                            background: "#f0f8ff",
                                            textAlign: "center",
                                            fontWeight: 700,
                                            fontSize: 14,
                                            color: "#1890ff",
                                            borderRadius: 8,
                                          }}
                                        >
                                          Chủ nhật
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {calendar.map((week, weekIndex) => (
                                        <tr key={weekIndex}>
                                          {week.map((date, dayIndex) => {
                                            if (!date) {
                                              return (
                                                <td
                                                  key={dayIndex}
                                                  style={{
                                                    border: "2px solid #f0f0f0",
                                                    height: 80,
                                                    minWidth: 80,
                                                    textAlign: "center",
                                                    verticalAlign: "middle",
                                                    background: "#fafafa",
                                                    borderRadius: 8,
                                                  }}
                                                >
                                                  {/* Empty cell */}
                                                </td>
                                              );
                                            }

                                            const shifts =
                                              doctorSchedule.schedules[date];
                                            const hasMorning =
                                              shifts &&
                                              shifts.includes("MORNING");
                                            const hasAfternoon =
                                              shifts &&
                                              shifts.includes("AFTERNOON");
                                            const isToday =
                                              date ===
                                              dayjs().format("YYYY-MM-DD");

                                            return (
                                              <td
                                                key={dayIndex}
                                                style={{
                                                  border: "2px solid #e8e8e8",
                                                  height: 80,
                                                  minWidth: 80,
                                                  textAlign: "center",
                                                  verticalAlign: "middle",
                                                  background: isToday
                                                    ? "#e6f7ff"
                                                    : "#fff",
                                                  borderRadius: 8,
                                                  padding: 4,
                                                  position: "relative",
                                                }}
                                              >
                                                {/* Date number */}
                                                <div
                                                  style={{
                                                    fontSize: 12,
                                                    fontWeight: "bold",
                                                    color: isToday
                                                      ? "#1890ff"
                                                      : "#666",
                                                    marginBottom: 4,
                                                  }}
                                                >
                                                  {dayjs(date).format("DD")}
                                                </div>

                                                {/* Morning shift */}
                                                <div
                                                  style={{
                                                    marginBottom: 2,
                                                    padding: 2,
                                                    borderRadius: 4,
                                                    background: hasMorning
                                                      ? "#f6ffed"
                                                      : "#f5f5f5",
                                                    border: hasMorning
                                                      ? "1px solid #52c41a"
                                                      : "1px solid #d9d9d9",
                                                    fontSize: 10,
                                                  }}
                                                >
                                                  <div
                                                    style={{
                                                      color: hasMorning
                                                        ? "#52c41a"
                                                        : "#999",
                                                      fontWeight: "bold",
                                                    }}
                                                  >
                                                    Sáng
                                                  </div>
                                                  {hasMorning && (
                                                    <button
                                                      onClick={(e) => {
                                                        e.preventDefault();
                                                        handleScheduleSelection(
                                                          date,
                                                          "MORNING"
                                                        );
                                                      }}
                                                      style={{
                                                        background: "#52c41a",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: 3,
                                                        padding: "2px 6px",
                                                        fontSize: 9,
                                                        fontWeight: "bold",
                                                        cursor: "pointer",
                                                        width: "100%",
                                                        marginTop: 2,
                                                      }}
                                                    >
                                                      Chọn
                                                    </button>
                                                  )}
                                                </div>

                                                {/* Afternoon shift */}
                                                <div
                                                  style={{
                                                    padding: 2,
                                                    borderRadius: 4,
                                                    background: hasAfternoon
                                                      ? "#fff7e6"
                                                      : "#f5f5f5",
                                                    border: hasAfternoon
                                                      ? "1px solid #fa8c16"
                                                      : "1px solid #d9d9d9",
                                                    fontSize: 10,
                                                  }}
                                                >
                                                  <div
                                                    style={{
                                                      color: hasAfternoon
                                                        ? "#fa8c16"
                                                        : "#999",
                                                      fontWeight: "bold",
                                                    }}
                                                  >
                                                    Chiều
                                                  </div>
                                                  {hasAfternoon && (
                                                    <button
                                                      onClick={(e) => {
                                                        e.preventDefault();
                                                        handleScheduleSelection(
                                                          date,
                                                          "AFTERNOON"
                                                        );
                                                      }}
                                                      style={{
                                                        background: "#fa8c16",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: 3,
                                                        padding: "2px 6px",
                                                        fontSize: 9,
                                                        fontWeight: "bold",
                                                        cursor: "pointer",
                                                        width: "100%",
                                                        marginTop: 2,
                                                      }}
                                                    >
                                                      Chọn
                                                    </button>
                                                  )}
                                                </div>

                                                {/* Full day indicator */}
                                                {hasMorning && hasAfternoon && (
                                                  <div
                                                    style={{
                                                      position: "absolute",
                                                      top: 2,
                                                      right: 2,
                                                      background: "#722ed1",
                                                      color: "white",
                                                      padding: "1px 3px",
                                                      borderRadius: 2,
                                                      fontSize: 8,
                                                      fontWeight: "bold",
                                                    }}
                                                  >
                                                    Cả ngày
                                                  </div>
                                                )}
                                              </td>
                                            );
                                          })}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            }
                          );
                        })()}

                        {/* Legend */}
                        <div
                          style={{
                            marginTop: 16,
                            padding: 12,
                            background: "#f0f8ff",
                            borderRadius: 8,
                            border: "1px solid #d6e4ff",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "bold",
                              marginBottom: 6,
                              color: "#1890ff",
                              fontSize: 12,
                            }}
                          >
                            Chú thích:
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 16,
                              flexWrap: "wrap",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <div
                                style={{
                                  width: 12,
                                  height: 12,
                                  background: "#f6ffed",
                                  border: "1px solid #52c41a",
                                  borderRadius: 2,
                                }}
                              ></div>
                              <span style={{ fontSize: 11 }}>Ca sáng</span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <div
                                style={{
                                  width: 12,
                                  height: 12,
                                  background: "#fff7e6",
                                  border: "1px solid #fa8c16",
                                  borderRadius: 2,
                                }}
                              ></div>
                              <span style={{ fontSize: 11 }}>Ca chiều</span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <div
                                style={{
                                  width: 12,
                                  height: 12,
                                  background: "#f5f5f5",
                                  border: "1px solid #d9d9d9",
                                  borderRadius: 2,
                                }}
                              ></div>
                              <span style={{ fontSize: 11 }}>Nghỉ</span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <div
                                style={{
                                  width: 12,
                                  height: 12,
                                  background: "#e6f7ff",
                                  border: "1px solid #1890ff",
                                  borderRadius: 2,
                                }}
                              ></div>
                              <span style={{ fontSize: 11 }}>Hôm nay</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                <Form.Item style={{ textAlign: "center", marginTop: "40px" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    disabled={!isLoggedIn}
                    size="large"
                    style={{
                      height: "50px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      padding: "0 40px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
                    }}
                  >
                    Gửi đăng ký
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default RegisterService;
