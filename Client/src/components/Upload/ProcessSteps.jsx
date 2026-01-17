import React from "react";
import { UploadCloud, Cpu, FileCheck } from "lucide-react";

const ProcessSteps = ({ currentStep }) => {
  const steps = [
    { id: 0, label: "Upload", icon: UploadCloud },
    { id: 1, label: "Preview", icon: FileCheck },
    { id: 2, label: "AI Analysis", icon: Cpu },
  ];

  return (
    <div className="flex justify-between items-center relative mb-8 px-4">
      {/* Connecting Line */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full" />
      <div 
        className="absolute top-1/2 left-0 h-1 bg-blue-500 -z-10 rounded-full transition-all duration-500"
        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} 
      />

      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${isActive ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white border-gray-300 text-gray-400"}
                ${isCurrent ? "scale-110 ring-4 ring-blue-100" : ""}
              `}
            >
              <Icon size={18} />
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-blue-600" : "text-gray-400"}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ProcessSteps;