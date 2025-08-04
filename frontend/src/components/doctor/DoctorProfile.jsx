import ProfileUpdate from "../../pages/ProfileUpdate";

const DoctorProfile = () => {
  // ===== DOCTOR PROFILE COMPONENT =====
  // Component wrapper đơn giản cho trang profile của doctor
  // Sử dụng ProfileUpdate component từ pages để hiển thị form cập nhật thông tin
  
  return (
    <div>
      {/* ===== PROFILE UPDATE COMPONENT ===== */}
      {/* Component shared ProfileUpdate được dùng chung cho các role */}
      <ProfileUpdate />
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default DoctorProfile;
