// src/components/common/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'accent' | 'amber';
    size?: 'small' | 'medium' | 'large';
    children: React.ReactNode;
    isLoading?: boolean;
}

const baseStyles = "rounded-md font-semibold transition duration-150 ease-in-out flex items-center justify-center space-x-2";

const sizeStyles = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
};

const variantStyles = {
    primary: "bg-primary-red text-white hover:bg-red-800 shadow-md",
    secondary: "bg-gray-200 text-text-dark hover:bg-gray-300 border border-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-md",
    accent: "bg-accent-gold text-primary-red hover:bg-yellow-400 shadow-md",
    amber: "bg-amber-500 text-white hover:bg-amber-600 shadow-md"
};

const Button: React.FC<ButtonProps> = ({ 
    variant = 'primary', 
    size = 'medium', 
    children, 
    isLoading = false,
    className = '', 
    disabled,
    ...props 
}) => {
    const finalClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className} ${
        (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
    }`;

    return (
        <button
            className={finalClassName}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
};

export default Button;