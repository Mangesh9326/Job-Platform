import React from "react";
import { MapPin, Search } from "lucide-react";

const JobFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="max-w-6xl mx-auto bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-10 sticky top-24 z-30">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Location Filter */}
        <div className="flex-1 relative group">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            name="location"
            placeholder="Filter by Location..."
            value={filters.location}
            onChange={onFilterChange}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
          />
        </div>

        {/* Domain Filter */}
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            name="domain"
            placeholder="Job Role / Domain..."
            value={filters.domain}
            onChange={onFilterChange}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
          />
        </div>

        {/* Salary Filter */}
        <div className="flex-1 relative group">
          <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-currency-rupee w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4 3.06h2.726c1.22 0 2.12.575 2.325 1.724H4v1.051h5.051C8.855 7.001 8 7.558 6.788 7.558H4v1.317L8.437 14h2.11L6.095 8.884h.855c2.316-.018 3.465-1.476 3.688-3.049H12V4.784h-1.345c-.08-.778-.357-1.335-.793-1.732H12V2H4z" />
          </svg>
          <input
            type="text"
            name="salary"
            placeholder="Min Salary (e.g. 50000)"
            value={filters.salary}
            onChange={onFilterChange}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default JobFilters;