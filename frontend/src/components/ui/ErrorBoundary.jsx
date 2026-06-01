import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-[60vh] grid place-items-center p-6">
        <div className="glass-card max-w-lg p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Something slipped in the interface
          </h1>
          <p className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>
            The workspace is safe. Refresh the view and InventoHub will rebuild the screen state.
          </p>
          <button className="btn-primary mx-auto mt-6" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
            Reload workspace
          </button>
        </div>
      </div>
    );
  }
}
