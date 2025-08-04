import React from "react";

const EducationTimeline = ({ 
  educationList = []    // Danh sách học vấn của doctor (mảng string)
}) => {
  // ===== EDUCATION TIMELINE COMPONENT =====
  // Component hiển thị danh sách học vấn/bằng cấp của doctor dưới dạng timeline
  // Tương tự SpecialtyTimeline nhưng màu dot là xanh dương thay vì xanh lá
  
  return (
    <div className="bg-white shadow rounded-lg p-5">
      {/* ===== HEADER ===== */}
      <h3 className="text-lg font-semibold mb-4">Học vấn</h3>
      
      {/* ===== EDUCATION LIST ===== */}
      {/* Timeline list với border trái và dots cho mỗi qualification */}
      <ul className="space-y-4 relative border-l-2 border-gray-200 pl-4">
        {educationList.map((item, index) => (
          <li key={index} className="relative ">
            {/* Dot indicator màu xanh dương cho mỗi education item */}
            <span className="absolute -left-[9px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow " />
            {/* Tên học vấn/bằng cấp */}
            <span className="text-gray-800 text-sm mx-2">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default EducationTimeline;
