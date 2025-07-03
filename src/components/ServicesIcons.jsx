import React from "react";
import { useNavigate } from "react-router-dom";

const ServicesIcons = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: "🧬",
      title: "THỤ TINH TRONG ỐNG NGHIỆM (IVF)",
      action: () => {
        console.log("Navigating to IVF service detail");
        navigate("/service-detail/2");
      },
    },
    {
      icon: "💉",
      title: "THỤ TINH NHÂN TẠO (IUI)",
      action: () => {
        console.log("Navigating to IUI service detail");
        navigate("/service-detail/1");
      },
    },
  ];

  return (
    <div className="w-full bg-orange-200 py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <div className="grid grid-cols-2 gap-16 max-w-2xl mx-auto">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105"
                onClick={service.action}
              >
                <div className="bg-white rounded-full w-28 h-28 flex items-center justify-center mb-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <span style={{ fontSize: "40px" }}>{service.icon}</span>
                </div>
                <h3 className="text-center font-semibold text-white hover:text-gray-100 transition-colors">
                  {service.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesIcons;
