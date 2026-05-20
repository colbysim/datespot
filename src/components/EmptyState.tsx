"use client";

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon,
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl gradient-brand-subtle flex items-center justify-center mb-5">
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-xs mb-6 leading-relaxed">
        {message}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="h-11 px-8 rounded-xl btn-gradient text-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
