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
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-xs mb-6">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="h-10 px-6 rounded-xl bg-brand-orange text-white text-sm font-semibold
                     hover:bg-brand-orange-dark active:scale-[0.98] transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
