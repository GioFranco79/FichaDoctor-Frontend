"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl border border-gray-200 bg-white shadow-sm
        dark:border-gray-700 dark:bg-gray-800
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div
      className={`
        border-b border-gray-200 px-6 py-4
        dark:border-gray-700
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div
      className={`
        border-t border-gray-200 px-6 py-4
        dark:border-gray-700
        ${className}
      `}
    >
      {children}
    </div>
  );
}
