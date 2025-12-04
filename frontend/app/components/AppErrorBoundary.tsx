import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[AppErrorBoundary] Caught error:', error, errorInfo);
    
    // 清除可能損壞的持久化狀態
    try {
      localStorage.removeItem('persist:mission-store');
      localStorage.removeItem('persist:chat-store');
      console.info('[AppErrorBoundary] Cleared potentially corrupted localStorage');
    } catch (e) {
      console.warn('[AppErrorBoundary] Failed to clear localStorage:', e);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    // 強制重新載入頁面以重新初始化所有狀態
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              系統發生錯誤
            </h2>
            <p className="text-gray-600 mb-4">
              頁面載入時發生錯誤，可能是因為資料損壞。我們已自動清除可能有問題的資料。
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              重新載入頁面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;