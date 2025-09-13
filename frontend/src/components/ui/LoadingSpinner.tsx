import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  variant?: 'primary' | 'secondary' | 'white';
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
  variant = 'primary',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const spinner = (
    <div className={cn(
      'animate-spin rounded-full border-2 border-solid border-current border-r-transparent',
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      <span className="sr-only">Loading...</span>
    </div>
  );

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      {spinner}
      {text && (
        <p className={cn(
          'font-medium',
          variantClasses[variant],
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

// Alternative pulsing dots spinner
export const DotSpinner: React.FC<Omit<LoadingSpinnerProps, 'variant'>> = ({
  size = 'md',
  className,
  text,
  fullScreen = false
}) => {
  const dotSizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
    xl: 'h-6 w-6'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const spinner = (
    <div className={cn('flex space-x-1', className)}>
      <div className={cn(
        'bg-blue-600 rounded-full animate-bounce',
        dotSizeClasses[size]
      )} style={{ animationDelay: '0ms' }}></div>
      <div className={cn(
        'bg-blue-600 rounded-full animate-bounce',
        dotSizeClasses[size]
      )} style={{ animationDelay: '150ms' }}></div>
      <div className={cn(
        'bg-blue-600 rounded-full animate-bounce',
        dotSizeClasses[size]
      )} style={{ animationDelay: '300ms' }}></div>
    </div>
  );

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      {spinner}
      {text && (
        <p className={cn(
          'font-medium text-gray-700',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

// Skeleton loading component
export const SkeletonLoader: React.FC<{
  className?: string;
  lines?: number;
  height?: string;
}> = ({ className, lines = 1, height = 'h-4' }) => {
  return (
    <div className={cn('animate-pulse space-y-3', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'bg-gray-200 rounded',
            height,
            index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

// Card skeleton for product cards
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;