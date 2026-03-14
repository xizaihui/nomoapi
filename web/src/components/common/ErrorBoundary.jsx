// ErrorBoundary — catches React render errors and shows fallback UI
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({ error: this.state.error, reset: this.handleReset })
          : this.props.fallback;
      }

      return (
        <div className='flex flex-col items-center justify-center gap-3 p-6 text-center'>
          <AlertTriangle className='h-8 w-8 text-destructive' />
          <p className='text-sm text-muted-foreground'>页面组件出错了</p>
          {this.state.error?.message && (
            <pre className='max-w-md text-xs text-muted-foreground bg-muted rounded p-2 overflow-auto'>
              {this.state.error.message}
            </pre>
          )}
          <Button variant='outline' size='sm' onClick={this.handleReset}>
            重试
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
