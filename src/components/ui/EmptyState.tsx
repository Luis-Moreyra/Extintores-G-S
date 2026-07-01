import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-gray-400 ${className}`}>
      <Icon className="w-12 h-12 mb-4 text-gray-300" strokeWidth={1.5} />
      <p className="text-lg font-medium text-gray-600">{title}</p>
      <p className="text-sm mt-1 text-center max-w-md">{description}</p>
    </div>
  );
}