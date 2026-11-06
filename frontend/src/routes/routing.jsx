import { BrowserRouter, Route, Routes } from 'react-router';
import HomePage from '../pages/home-page.jsx';
import LoyaltyPage from '../pages/loyalty-page.jsx';
import NotFoundPage from '../pages/not-found-page.jsx';
import SurveysPage from '../pages/surveys-page.jsx';

export default function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lealtad" element={<LoyaltyPage />} />
        <Route path="/encuestas" element={<SurveysPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
