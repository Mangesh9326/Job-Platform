import React from "react";

const JobSkeleton = () => (
  // We keep the wrapper div purely for structure, but the coloring happens in the main page
  <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
    <div className="lg:col-span-2 space-y-8">
      <div className="h-64 bg-white rounded-4xl border border-gray-100 shadow-sm"></div>
      <div className="h-96 bg-white rounded-4xl border border-gray-100 shadow-sm"></div>
    </div>
    <div className="space-y-6">
      <div className="h-64 bg-gray-200 rounded-3xl opacity-50"></div>
      <div className="h-48 bg-white rounded-3xl border border-gray-100 shadow-sm"></div>
    </div>
  </div>
);

export default JobSkeleton;