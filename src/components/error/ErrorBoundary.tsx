import { Component, type ReactNode } from "react";

type ErrorFallbackProps = {
  error: Error;
  reset: () => void;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: (props: ErrorFallbackProps) => ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | undefined;
};

const DefaultErrorFallback = ({ error, reset }: ErrorFallbackProps) => (
  <div className="flex h-full flex-col items-center justify-center gap-4 text-red-400">
    <span className="text-lg">エラーが発生しました</span>
    <span className="text-sm text-gray-500">{error.message}</span>
    <button
      onClick={reset}
      className="rounded bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
    >
      再試行
    </button>
  </div>
);

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error !== undefined) {
      if (fallback !== undefined) {
        return fallback({ error, reset: this.handleReset });
      }
      return <DefaultErrorFallback error={error} reset={this.handleReset} />;
    }

    return children;
  }
}
