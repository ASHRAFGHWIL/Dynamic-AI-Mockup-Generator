import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = "px-6 py-3 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform duration-150 ease-in-out";
  const variantClasses = {
    primary: "bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-400 dark:disabled:bg-gray-700",
    secondary: "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 dark:disabled:text-gray-400",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
