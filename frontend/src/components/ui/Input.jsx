import React from 'react';

const Input = React.forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  icon: Icon,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-text-primary mb-1.5 inline-block">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full bg-surface border border-border rounded-input px-3 py-2 text-sm text-text-primary
            focus:ring-1 focus:ring-primary focus:border-primary focus:bg-white
            outline-none transition-all placeholder:text-text-muted shadow-sm
            ${Icon ? 'pl-9' : ''}
            ${error ? 'border-status-danger-text focus:ring-status-danger-text bg-status-danger-bg' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-status-danger-text font-medium animate-fade-in">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
