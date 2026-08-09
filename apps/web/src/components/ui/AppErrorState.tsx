"use client";

interface AppErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function AppErrorState({ title, message, onRetry }: AppErrorStateProps) {
  return (
    <div className="app-error-state" role="alert">
      <div className="app-error-card">
        <p className="app-error-kicker">Something went wrong</p>
        <h1 className="app-error-title">{title}</h1>
        <p className="app-error-message">{message}</p>
        {onRetry ? (
          <button type="button" className="btn btn-primary btn-sm" onClick={onRetry}>
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
}
