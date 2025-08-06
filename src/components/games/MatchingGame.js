import React, { useState, useEffect } from 'react';
import { useWords } from '../../hooks/useWords';
import { speakWord } from '../../utils/speechSynthesis';

/**
 * Matching Game - Drag and drop English words to Hebrew translations
 * Features: Drag/drop interface, progress tracking, and immediate feedback
 */
function MatchingGame({ words, onExit }) {
  const { updateWordProgress } = useWords();
  const [gameState, setGameState] = useState('playing'); // playing, completed
  const [matches, setMatches] = useState({});
  const [draggedWord, setDraggedWord] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  // Shuffle words and create pairs
  const [englishWords, setEnglishWords] = useState([]);
  const [hebrewWords, setHebrewWords] = useState([]);

  useEffect(() => {
    // Take first 6 words and shuffle them
    const gameWords = words.slice(0, 6);
    const shuffledEnglish = [...gameWords].sort(() => Math.random() - 0.5);
    const shuffledHebrew = [...gameWords].sort(() => Math.random() - 0.5);
    
    setEnglishWords(shuffledEnglish);
    setHebrewWords(shuffledHebrew);
  }, [words]);

  const handleDragStart = (e, word) => {
    setDraggedWord(word);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, hebrewWord) => {
    e.preventDefault();
    
    if (!draggedWord) return;

    const isCorrect = draggedWord.id === hebrewWord.id;
    setAttempts(prev => prev + 1);

    if (isCorrect) {
      setMatches(prev => ({
        ...prev,
        [draggedWord.id]: hebrewWord.id
      }));
      setScore(prev => prev + 1);
      updateWordProgress(draggedWord.id, true, 'matching');
      
      // Speak the word when correctly matched
      speakWord(draggedWord.english);
    } else {
      updateWordProgress(draggedWord.id, false, 'matching');
      // Show temporary feedback for wrong match
      const dropZone = e.target.closest('.drop-target');
      if (dropZone) {
        dropZone.classList.add('incorrect-drop');
        setTimeout(() => {
          dropZone.classList.remove('incorrect-drop');
        }, 1000);
      }
    }

    setDraggedWord(null);

    // Check if game is completed
    if (Object.keys(matches).length + (isCorrect ? 1 : 0) === englishWords.length) {
      setGameState('completed');
    }
  };

  const resetGame = () => {
    setMatches({});
    setScore(0);
    setAttempts(0);
    setGameState('playing');
    setDraggedWord(null);
    
    // Reshuffle words
    const gameWords = words.slice(0, 6);
    const shuffledEnglish = [...gameWords].sort(() => Math.random() - 0.5);
    const shuffledHebrew = [...gameWords].sort(() => Math.random() - 0.5);
    
    setEnglishWords(shuffledEnglish);
    setHebrewWords(shuffledHebrew);
  };

  const progress = (Object.keys(matches).length / englishWords.length) * 100;

  if (gameState === 'completed') {
    const successRate = Math.round((score / attempts) * 100);
    
    return (
      <div className="game-completed">
        <div className="completion-header">
          <h2>כל הכבוד!</h2>
          <p>השלמת את משחק ההתאמה בהצלחה</p>
        </div>
        
        <div className="completion-stats">
          <div className="stat-item">
            <span className="stat-number">{score}</span>
            <span className="stat-label">התאמות נכונות</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{attempts}</span>
            <span className="stat-label">סך ניסיונות</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{successRate}%</span>
            <span className="stat-label">אחוז הצלחה</span>
          </div>
        </div>
        
        <div className="completion-actions">
          <button className="btn btn-primary" onClick={resetGame}>
            שחק שוב
          </button>
          <button className="btn btn-secondary" onClick={onExit}>
            חזור למשחקים
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="matching-game-container">
      {/* Game Progress */}
      <div className="game-progress">
        <div className="progress-info">
          <span>התקדמות: {Object.keys(matches).length}/{englishWords.length}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="score-info">
          <span>ניקוד: {score}/{attempts}</span>
        </div>
      </div>

      {/* Game Instructions */}
      <div className="game-instructions">
        <p>גרור את המילים באנגלית מהעמודה השמאלית אל התרגום הנכון בעברית בעמודה הימנית</p>
      </div>

      {/* Game Board */}
      <div className="matching-board">
        {/* English Words (draggable) */}
        <div className="word-bank english-bank">
          <h3 className="bank-title">מילים באנגלית</h3>
          <div className="words-list">
            {englishWords.map(word => {
              const isMatched = matches[word.id];
              
              return (
                <div
                  key={word.id}
                  className={`draggable-word ${isMatched ? 'matched' : ''}`}
                  draggable={!isMatched}
                  onDragStart={(e) => handleDragStart(e, word)}
                >
                  <div className="word-content">
                    <span className="english-text">{word.english}</span>
                    <button 
                      className="word-speaker-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(word.english);
                      }}
                    >
                      השמע
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hebrew Words (drop targets) */}
        <div className="word-bank hebrew-bank">
          <h3 className="bank-title">תרגום עברי</h3>
          <div className="words-list">
            {hebrewWords.map(word => {
              const isMatched = Object.values(matches).includes(word.id);
              const matchedEnglishId = Object.keys(matches).find(
                key => matches[key] === word.id
              );
              const matchedEnglishWord = matchedEnglishId ? 
                englishWords.find(w => w.id === matchedEnglishId) : null;
              
              return (
                <div
                  key={word.id}
                  className={`drop-target ${isMatched ? 'filled' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, word)}
                >
                  {isMatched ? (
                    <div className="matched-pair">
                      <span className="english-text">{matchedEnglishWord?.english}</span>
                      <span className="hebrew-text">{word.hebrew}</span>
                    </div>
                  ) : (
                    <span className="drop-hint">{word.hebrew}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Game Actions */}
      <div className="game-actions">
        <button className="btn btn-secondary" onClick={resetGame}>
          התחל מחדש
        </button>
        <button className="btn btn-secondary" onClick={onExit}>
          צא מהמשחק
        </button>
      </div>
    </div>
  );
}

export default MatchingGame;