import React, { useEffect, useRef, forwardRef } from "react";

const Edit = forwardRef(
  ({ value, onChange, onBlur, placeholder = "", className = "" }, externalRef) => {
    const localRef = useRef(null);
    const ref = externalRef || localRef;

    useEffect(() => {
      if (ref.current && ref.current.innerText !== String(value ?? "")) {
        ref.current.innerText = value ?? "";
      }
    }, [value]);

    return (
      <span
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerText)}
        onBlur={onBlur}
        className={`
          outline-none focus:outline-none transition-colors duration-200
          border-b border-transparent hover:border-blue-300 focus:border-blue-500
          hover:bg-blue-50/50 focus:bg-blue-50 rounded px-1 -mx-1
          cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400
          ${className}
        `}
        data-placeholder={placeholder}
        style={{ minWidth: "1ch", display: "inline-block" }}
      />
    );
  }
);

export default Edit;