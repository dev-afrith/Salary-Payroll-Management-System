import React from 'react';

const Select = React.forwardRef(({ label, name, options = [], error, helperText, className = '', ...props }, ref) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        ref={ref}
        className={`w-full border rounded-xl px-4 py-3 outline-none transition-all text-base font-semibold
          ${error
            ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50'
            : 'border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          }
          bg-slate-50 hover:bg-white text-slate-800`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-gray-400">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
