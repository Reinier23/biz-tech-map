import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GraphViewErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GraphView Error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center h-96 bg-gradient-to-br from-card/50 to-card/30 rounded-xl border border-border/50"
        >
          <div className="text-center max-w-md">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Graph View Error</h3>
            <p className="text-muted-foreground mb-4">
              Something went wrong while loading the data flow visualization.
            </p>
            {this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <Button 
              onClick={this.handleRetry} 
              variant="outline" 
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default GraphViewErrorBoundary;
