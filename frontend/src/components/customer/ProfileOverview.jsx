import ProfileUpdate from "../../pages/ProfileUpdate";

const ProfileOverview = () => {
  // ===== CUSTOMER PROFILE OVERVIEW COMPONENT =====
  // Component wrapper đơn giản cho trang profile overview của customer
  // Sử dụng ProfileUpdate component shared từ pages để hiển thị form cập nhật thông tin
  
  return (
    <div>
      {/* ===== PROFILE UPDATE COMPONENT ===== */}
      {/* Component shared ProfileUpdate được dùng chung cho các role */}
      <ProfileUpdate />
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default ProfileOverview;
