import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, Home, ShieldCheck } from 'lucide-react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[PetSOS Error Boundary caught an error]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback-page">
          <div className="error-fallback-card card animate-scale-up">
            <div className="error-logo-wrap">
              <img src="/petsos-logo.svg" alt="PetSOS Brand Logo" className="error-brand-logo" />
            </div>

            <div className="error-shield-status">
              <ShieldCheck size={16} color="#10b981" />
              <span>Pet Profiles & Emergency Services Secure</span>
            </div>

            <h2>🐾 Oops! Something didn't load quite right</h2>
            <p>
              {this.props.fallbackMessage ||
                'We ran into an unexpected hiccup loading this component. Your pet data and emergency contacts remain completely safe.'}
            </p>

            <div className="error-actions-row">
              <button type="button" className="btn btn-primary" onClick={this.handleReload}>
                <RefreshCw size={15} /> Try Again
              </button>
              <button type="button" className="btn btn-secondary" onClick={this.handleGoHome}>
                <Home size={15} /> Home Emergency Map
              </button>
            </div>

            <small className="error-support-hint">
              Need immediate help? Click the floating chat bubble in the bottom right corner or contact 24/7 support.
            </small>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
