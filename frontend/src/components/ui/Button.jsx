import React from 'react';

const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false, 
  loading = false,
  type = 'button',
  icon: Icon,
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all rounded-btn focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white focus:ring-primary shadow-enterprise',
    secondary: 'bg-surface hover:bg-gray-200 text-text-primary border border-border focus:ring-border',
    danger: 'bg-status-danger-bg hover:bg-red-200 text-status-danger-text focus:ring-status-danger-text',
    success: 'bg-status-success-bg hover:bg-green-200 text-status-success-text focus:ring-status-success-text',
    outline: 'bg-transparent border border-border hover:bg-surface text-text-primary focus:ring-border',
    ghost: 'hover:bg-surface text-text-secondary focus:ring-border'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base'
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />}
      {!loading && Icon && <Icon size={16} className={children ? 'mr-2' : ''} />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
