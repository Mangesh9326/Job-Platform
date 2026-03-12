import React, { forwardRef } from "react";
import { motion } from "framer-motion";

const JobLoader = forwardRef(({ hasMore, displayCount }, ref) => {
  return (
    <div ref={ref} className="h-20 flex items-center justify-center mt-10">
      {hasMore && (
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              className="w-3 h-3 bg-blue-500 rounded-full"
            />
          ))}
        </div>
      )}
      {!hasMore && displayCount > 0 && (
        <p className="text-gray-400 text-sm font-medium">You've seen all the jobs!</p>
      )}
    </div>
  );
});

export default JobLoader;