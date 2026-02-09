import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import ErrorBoundary from '../components/ErrorBoundary';

// A component that throws an error for testing
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>child content</div>;
};

// Suppress console.error for error boundary tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ChakraProvider>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </ChakraProvider>
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('renders error UI when child throws', () => {
    render(
      <ChakraProvider>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </ChakraProvider>
    );
    expect(screen.getByText("Oops! Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/We're sorry for the inconvenience/)).toBeInTheDocument();
  });

  it('renders Refresh Page button in error state', () => {
    render(
      <ChakraProvider>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </ChakraProvider>
    );
    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
  });

  it('renders Go to Homepage button in error state', () => {
    render(
      <ChakraProvider>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </ChakraProvider>
    );
    expect(screen.getByRole('button', { name: /go to homepage/i })).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    // import.meta.env.PROD is false in test environment
    render(
      <ChakraProvider>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </ChakraProvider>
    );
    expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();
  });
});
