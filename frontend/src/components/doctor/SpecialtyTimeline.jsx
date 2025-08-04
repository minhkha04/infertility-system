import React from "react";

const SpecialtyTimeline = ({ 
  specialtyList = []    // Danh sách chuyên ngành của doctor (mảng string)
}) => {
  // ===== SPECIALTY TIMELINE COMPONENT =====
  // Component hiển thị danh sách chuyên ngành của doctor dưới dạng timeline
  // Sử dụng UI giống timeline với dots và border trái
  
  return (
    <div className="bg-white shadow rounded-lg p-5">
      {/* ===== HEADER ===== */}
      <h3 className="text-lg font-semibold mb-4">Chuyên ngành</h3>
      
      {/* ===== SPECIALTY LIST ===== */}
      {/* Timeline list với border trái và dots cho mỗi specialty */}
      <ul className="space-y-4 relative border-l-2 border-gray-200 pl-4">
        {specialtyList.map((item, index) => (
          <li key={index} className="relative">
            {/* Dot indicator cho mỗi specialty item */}
            <span className="absolute -left-[9px] top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow" />
            {/* Tên chuyên ngành */}
            <span className="text-gray-800 text-sm mx-2">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default SpecialtyTimeline;
