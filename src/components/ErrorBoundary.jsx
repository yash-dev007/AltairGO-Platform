import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(_error, _info) {
    // Errors are captured in state via getDerivedStateFromError
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'Poppins, sans-serif',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', color: '#141413', marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ color: '#5e5d59', marginBottom: '2rem', maxWidth: '400px' }}>
            An unexpected error occurred. Please refresh the page and try again.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              background: '#141413',
              color: 'white',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: '600',
              fontSize: '1rem',
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
