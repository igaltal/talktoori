import React, { useState, useEffect } from 'react';
import { useWords } from '../hooks/useWords';
import { speakWord } from '../utils/speechSynthesis';

/**
 * Hotel Word Game - Specialized game for hotel/travel vocabulary
 * Features: Random word reveal, pronunciation, and travel context
 */
function HotelGame() {
  const { words, getHotelWords, updateWordProgress } = useWords();
  const [currentWord, setCurrentWord] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [hotelWords, setHotelWords] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameHistory, setGameHistory] = useState([]);

  // Initialize hotel words
  useEffect(() => {
    const availableHotelWords = getHotelWords();
    if (availableHotelWords.length === 0) {
      // If no hotel words, use all words
      setHotelWords(words);
    } else {
      setHotelWords(availableHotelWords);
    }
  }, [words, getHotelWords]);

  // Select random word
  const selectRandomWord = () => {
    if (hotelWords.length === 0) return null;
    
    const availableWords = hotelWords.filter(word => 
      !gameHistory.some(h => h.id === word.id)
    );
    
    if (availableWords.length === 0) {
      // Reset history if all words used
      setGameHistory([]);
      return hotelWords[Math.floor(Math.random() * hotelWords.length)];
    }
    
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  };

  // Start new round
  const startNewRound = () => {
    const word = selectRandomWord();
    setCurrentWord(word);
    setShowTranslation(false);
    setRound(prev => prev + 1);
  };

  // Reveal translation
  const revealTranslation = () => {
    if (!showTranslation && currentWord) {
      setShowTranslation(true);
      setScore(prev => prev + 1);
      updateWordProgress(currentWord.id, true, 'hotel-game');
      
      // Add to history
      setGameHistory(prev => [...prev, {
        id: currentWord.id,
        english: currentWord.english,
        hebrew: currentWord.hebrew,
        round: round
      }]);
      
      // Speak the word
      speakWord(currentWord.english);
    }
  };

  // Start game
  useEffect(() => {
    if (hotelWords.length > 0 && !currentWord) {
      startNewRound();
    }
  }, [hotelWords, currentWord, startNewRound]);

  const resetGame = () => {
    setScore(0);
    setRound(1);
    setGameHistory([]);
    setCurrentWord(null);
    setShowTranslation(false);
    // Will trigger new round in useEffect
  };

  const playPronunciation = () => {
    if (currentWord) {
      speakWord(currentWord.english);
    }
  };

  if (words.length === 0) {
    return (
      <div className="page-container">
              <div className="page-header">
        <h1 className="page-title">משחק מלון</h1>
        <p className="page-subtitle">
          תרגול מילים הקשורות למלונות ונסיעות
        </p>
      </div>
        
        <div className="empty-state">
          <h3>עדיין לא הוספת מילים</h3>
          <p>כדי לשחק במשחק המלון, עליך להוסיף מילים לרשימה שלך קודם</p>
          <a href="/words" className="btn btn-primary mt-4">
            הוסף מילים
          </a>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="page-container">
        <div className="loading">
          <p>טוען משחק...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">משחק מלון</h1>
        <p className="page-subtitle">
          גלה מילים חדשות הקשורות למלונות ונסיעות
        </p>
      </div>

      {/* Game Stats */}
      <div className="hotel-game-stats">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-label">סיבוב</span>
            <span className="stat-value">{round}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">מילים נלמדו</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">מילים זמינות</span>
            <span className="stat-value">{hotelWords.length}</span>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="hotel-game-card">
        <div className="game-card-header">
          <h2>מילה מספר {round}</h2>
          <p>לחץ על המילה כדי לשמוע את ההגייה</p>
        </div>

        <div className="word-display-area">
          {/* English Word */}
          <div className="current-word-display">
            <div className="word-display-container">
              <div className="english-text word-text">{currentWord.english}</div>
              <button 
                className="word-pronunciation-btn"
                onClick={playPronunciation}
                title="השמע הגייה"
              >
                השמע הגייה
              </button>
            </div>
          </div>

          {/* Reveal Button / Translation */}
          {!showTranslation ? (
            <div className="reveal-section">
              <button 
                className="btn btn-primary btn-large reveal-btn"
                onClick={revealTranslation}
              >
                גלה תרגום
              </button>
              <p className="reveal-hint">
                לחץ כדי לגלות את המשמעות בעברית
              </p>
            </div>
          ) : (
            <div className="translation-revealed">
              <div className="hebrew-translation">
                <h3>{currentWord.hebrew}</h3>
              </div>
              
              {currentWord.example && (
                <div className="example-sentence">
                  <p className="example-label">משפט לדוגמה:</p>
                  <p className="example-text english-text">"{currentWord.example}"</p>
                </div>
              )}
              
              <div className="word-actions">
                <button 
                  className="btn btn-success"
                  onClick={startNewRound}
                >
                  מילה הבאה
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={playPronunciation}
                >
                  שמע שוב
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game History */}
      {gameHistory.length > 0 && (
        <div className="game-history">
          <h3>מילים שנלמדו הבהסססיון:</h3>
          <div className="history-grid">
            {gameHistory.slice(-6).map((historyWord, index) => (
              <div key={index} className="history-word">
                <span className="english-text">{historyWord.english}</span>
                <span className="hebrew-text">{historyWord.hebrew}</span>
                <button 
                  className="history-speaker-btn"
                  onClick={() => speakWord(historyWord.english)}
                  title="השמע הגייה"
                >
                  השמע
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game Controls */}
      <div className="game-controls">
        <button 
          className="btn btn-secondary"
          onClick={resetGame}
        >
          התחל מחדש
        </button>
        <a href="/games" className="btn btn-primary">
          משחקים נוספים
        </a>
      </div>

      {/* Hotel Context Info */}
      <div className="hotel-context-info">
        <h4>💡 טיפ למטייל</h4>
        <p>
          המילים במשחק זה נבחרו כדי לעזור לך בנסיעות ובמלונות. 
          תרגל אותן היטב כדי להרגיש בטוח יותר בחו"ל!
        </p>
      </div>
    </div>
  );
}

export default HotelGame;