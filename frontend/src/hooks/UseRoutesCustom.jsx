import React from "react";
import { useRoutes } from "react-router-dom";
import UserTemplate from "../template/UserTemplate";
import PageNotFound from "../components/PageNotFound";
import { path } from "../common/path";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import VerifyPage from "../pages/VerifyPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ServicesPage from "../pages/ServicesPage";
import ServiceDetailPage from "../pages/ServiceDetailPage";
import BlogPage from "../pages/BlogPage";
import BlogDetailPage from "../pages/BlogDetailPage";
import OurStaffPage from "../pages/OurStaffPage";
import ContactsPage from "../pages/ContactsPage";
import DoctorDetailPage from "../pages/DoctorDetailPage";
import RegisterService from "../pages/RegisterService";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminPage from "../pages/AdminPage/AdminPage";
import ManagerPage from "../pages/ManagerPage/ManagerPage";
import ResendOtpPage from "../pages/ResendOtpPage";
import DoctorDashboard from "../pages/DoctorDashboard";
import CustomerDashboard from "../pages/CustomerDashboard";
import ProfileUpdate from "../pages/ProfileUpdate";
import RenderCreateTreatment from "../components/manager/managerService/RenderCreateTreatment";
import FeedbackCustomer from "../components/customer/FeedbackCustomer";
import CreateBlogPage from "../components/blog/CreateBlog";
import PaymentPage from "../pages/PaymentPage";
import AuthPage from "../pages/AuthPage";

const UseRoutesCustom = () => {
  const routes = useRoutes([
    {
      path: path.homePage,
      element: <UserTemplate />,
    },

    {
      path: path.signIn,
      element: <LoginPage />,
    },
    {
      path: path.signUp,
      element: <RegisterPage />,
    },
    {
      path: path.testLogin,
      element: <AuthPage />,
    },
    {
      path: path.verify,
      element: <VerifyPage />,
    },
    {
      path: path.forgotPassword,
      element: <ForgotPasswordPage />,
    },
    {
      path: path.resetPassword,
      element: <ResetPasswordPage />,
    },
    {
      path: path.services,
      element: <ServicesPage />,
    },
    {
      path: path.serviceDetail,
      element: <ServiceDetailPage />,
    },
    {
      path: path.blog,
      element: <BlogPage />,
    },
    {
      path: path.blogDetail,
      element: <BlogDetailPage />,
    },
    {
      path: path.ourStaff,
      element: <OurStaffPage />,
    },
    {
      path: path.contacts,
      element: <ContactsPage />,
    },
    {
      path: path.doctorDetail,
      element: <DoctorDetailPage />,
    },
    {
      path: path.appointment,
      element: (
        <ProtectedRoute>
          <RegisterService />
        </ProtectedRoute>
      ),
    },
    {
      path: path.admin,
      element: <AdminPage />,
    },
    {
      path: "/manager/*",
      element: <ManagerPage />,
    },
    {
      path: path.managerRenderCreateTreatmentService,
      element: <RenderCreateTreatment />,
    },
    {
      path: "/doctor-dashboard/*",
      element: <DoctorDashboard />,
    },
    {
      path: "/customer-dashboard/*",
      element: <CustomerDashboard />,
    },

    {
      path: path.resendOtp,
      element: <ResendOtpPage />,
    },

    {
      path: path.updataProfile,
      element: <ProfileUpdate />,
    },

    {
      path: "/create-blog",
      element: <CreateBlogPage />,
    },
    {
      path: "/doctor/create-blog",
      element: <CreateBlogPage />,
    },
    {
      path: "/customer/create-blog",
      element: <CreateBlogPage />,
    },
    {
      path: "/manager/create-blog",
      element: <CreateBlogPage />,
    },
    {
      path: path.pageNotFound,
      element: <PageNotFound />,
    },
  ]);
  return routes;
};

export default UseRoutesCustom;
