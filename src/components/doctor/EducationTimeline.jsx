import React from "react";

const EducationTimeline = ({ educationList = [] }) => {
  return (
    <div className="bg-white shadow rounded-lg p-5">
      <h3 className="text-lg font-semibold mb-4">Học vấn</h3>
      <ul className="space-y-4 relative border-l-2 border-gray-200 pl-4">
        {educationList.map((item, index) => (
          <li key={index} className="relative ">
            <span className="absolute -left-[9px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow " />
            <span className="text-gray-800 text-sm mx-2">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EducationTimeline;
