import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MCQPage from './WelcomePage';
import AdminPage from './Admin';
import Discussion from './pages/Discussions';
import DashboardPage from './pages/Dashboard';
import TrialPage from './pages/TrialPage';
import AuthPage from './pages/AuthPage'; // Add this
import PoliticianDashboard from './pages/PoliticianDashboard'; // Add this

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MCQPage />} />
        <Route path="/auth" element={<AuthPage />} /> {/* Add this */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/discuss" element={<Discussion />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/politician-dashboard" element={<PoliticianDashboard />} /> {/* Add this */}
        <Route path='/trial' element={<TrialPage />} />
      </Routes>
    </Router>
  );
};

export default App;
