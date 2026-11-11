import { Component } from 'react';

/** Last safety net: shows a friendly message instead of a blank screen. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error('ASTRA hit a problem:', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="mx-auto max-w-lg p-8 text-center">
        <div className="text-6xl" aria-hidden="true">🛰️</div>
        <h1 className="mt-4 font-display text-3xl font-bold">Oops! Mission Control lost signal.</h1>
        <p className="mt-2 text-slate-300">Something went wrong. Your saved mission is safe. Let’s reload and try again.</p>
        <button type="button" className="btn btn-primary mt-6" onClick={() => window.location.assign('/')}>
          Reload ASTRA
        </button>
      </main>
    );
  }
}
