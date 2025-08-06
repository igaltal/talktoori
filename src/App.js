import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import WordList from './pages/WordList';
import Games from './pages/Games';
import HotelGame from './pages/HotelGame';
import StoryGenerator from './pages/StoryGenerator';
import Statistics from './pages/Statistics';
import './App.css';

/**
 * Main App component with routing
 * Provides navigation and page routing for the vocabulary learning app
 */
function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<WordList />} />
            <Route path="/words" element={<WordList />} />
            <Route path="/games" element={<Games />} />
            <Route path="/hotel-game" element={<HotelGame />} />
            <Route path="/story" element={<StoryGenerator />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;