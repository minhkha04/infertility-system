import { useRegisterLogic } from "../hooks/useRegisterLogic";
import RegisterForm from "../components/registerService/RegisterForm";
import { HeartFilled } from "@ant-design/icons";
import UserHeader from "../components/UserHeader";
import UserFooter from "../components/UserFooter";
export default function RegisterServicePage() {
  const {
    form,
    doctors,
    services,
    loading,
    availableDoctors,
    setSelectedDate,
    setSelectedShift,
    onSubmit,
    onDoctorChange,
  } = useRegisterLogic();

  return (
    <>
      <UserHeader />

      <div className="w-full bg-[#FFF8ED] py-16 px-4">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-orange-400 to-orange-500 text-white p-4 rounded-full shadow-lg text-3xl">
                <HeartFilled />
              </div>
            </div>

            {/* Tiêu đề */}
            <h1 className="text-3xl md:text-4xl font-bold text-orange-600 mb-4">
              Đăng ký khám dịch vụ hiếm muộn
            </h1>

            {/* Mô tả */}
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              Vui lòng điền đầy đủ thông tin để chúng tôi có thể hỗ trợ bạn tốt
              nhất. <br />
              Đội ngũ bác sĩ chuyên nghiệp sẽ đồng hành cùng bạn trên hành trình
              này.
            </p>
          </div>
          <RegisterForm
            form={form}
            doctors={doctors}
            availableDoctors={availableDoctors}
            services={services}
            loading={loading}
            onSubmit={onSubmit}
            onDoctorChange={onDoctorChange}
            setSelectedDate={setSelectedDate}
            setSelectedShift={setSelectedShift}
          />
        </div>
      </div>
      <UserFooter />
    </>
  );
}
