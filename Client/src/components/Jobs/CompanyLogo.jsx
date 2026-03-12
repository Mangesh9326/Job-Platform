import React from "react";

const CompanyLogo = ({ name }) => {
  const initials = name ? name.slice(0, 2).toUpperCase() : "JP";
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-emerald-500",
    "bg-orange-500", "bg-indigo-500", "bg-pink-500"
  ];
  const colorClass = colors[(name?.length || 0) % colors.length];

  return (
    <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md`}>
      {initials}
    </div>
  );
};

export default CompanyLogo;