import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <p className="eyebrow">404</p>
      <h1>No encontramos esa página</h1>
      <Link className="button" to="/">Volver al inicio</Link>
    </main>
  );
}
