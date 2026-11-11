import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page text-center">
      <div className="text-7xl" aria-hidden="true">🛸</div>
      <h1 className="mt-3 font-display text-4xl font-bold">Lost in space!</h1>
      <p className="mt-2 text-slate-300">We could not find that page. Let’s head back to Mission Control.</p>
      <Link to="/" className="btn btn-primary btn-lg mt-6">Back to Home</Link>
    </div>
  );
}
