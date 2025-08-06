import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import WordList from './pages/WordList';
import Games from './pages/Games';
import HotelGame from './pages/HotelGame';
import StoryGenerator from './pages/StoryGenerator';
import Statistics from './pages/Statistics';
import './App.css';

/**
 * App layout component that handles conditional styling based on route
 */
function AppLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <div className="App">
      <Navigation />
      <main className={`main-content ${isHomePage ? 'home-main' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/words" element={<WordList />} />
          <Route path="/games" element={<Games />} />
          <Route path="/hotel-game" element={<HotelGame />} />
          <Route path="/story" element={<StoryGenerator />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </main>
    </div>
  );
}

/**
 * Main App component with routing
 * Provides navigation and page routing for the vocabulary learning app
 */
function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;