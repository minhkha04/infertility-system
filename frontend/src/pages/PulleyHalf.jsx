import React from "react";

function PulleyHalf({ side, imageSrc, offsetX = "0%" }) {
  const positionClass = side === "left" ? "left-0" : "right-0";

  return (
    <div
      className={`absolute top-0 ${positionClass} w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out`}
      style={{ transform: `translateX(${offsetX})` }}
    >
      <img
        src={imageSrc}
        alt="Pulley Half"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default PulleyHalf;
