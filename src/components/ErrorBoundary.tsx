import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by Mafogh ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-950 text-slate-100 p-6 text-center font-sans select-none">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-rose-500/15 text-rose-400 rounded-xl flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <h2 className="text-base font-bold text-white">خطایی رخ داده است</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              سیستم تدوینگر برای جلوگیری از آسیب به پروژه این بخش را متوقف کرد.
            </p>

            {this.state.error && (
              <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-rose-300 overflow-x-auto text-left dir-ltr">
                {this.state.error.message}
              </pre>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <RefreshCw size={14} />
              <span>بارگذاری مجدد تدوینگر</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
