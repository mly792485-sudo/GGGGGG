import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, RotateCcw, AlertTriangle } from 'lucide-react';
import { safeStorage } from '../utils/safeStorage';

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
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      safeStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          id="app-error-boundary"
          className="min-h-screen bg-[#070D0E] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans"
          dir="rtl"
        >
          <div className="max-w-md w-full bg-[#0C181A] border border-emerald-900/40 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-amber-300">حدث خطأ غير متوقع</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                نعتذر عن هذا الخطأ المؤقت. يمكنك إعادة تشغيل التطبيق أو إعادة تعيين الذاكرة المؤقتة.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="error-reload-btn"
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all cursor-pointer shadow-lg shadow-emerald-900/30"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحميل</span>
              </button>

              <button
                id="error-reset-cache-btn"
                type="button"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-sm transition-all cursor-pointer border border-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
                <span>مسح الذاكرة وإعادة التشغيل</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
