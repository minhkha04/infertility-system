import FeedbackCustomer from "./FeedbackCustomer";

const Feedback = () => {
  // ===== CUSTOMER FEEDBACK COMPONENT =====
  // Component wrapper cho trang feedback của customer
  // Render FeedbackCustomer component chứa logic chính của feedback system
  
  return (
    <div>
      {/* ===== FEEDBACK CUSTOMER COMPONENT ===== */}
      {/* Component chính xử lý tạo và quản lý feedback của customer */}
      <FeedbackCustomer />
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default Feedback;
