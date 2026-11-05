import { BrowserRouter, Route, Routes } from 'react-router';
import HomePage from '../pages/home-page.jsx';
import NotFoundPage from '../pages/not-found-page.jsx';

export default function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
