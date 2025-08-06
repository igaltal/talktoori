import React, { useState } from 'react';
import { useWords } from '../hooks/useWords';
import MatchingGame from '../components/games/MatchingGame';
import FillInBlankGame from '../components/games/FillInBlankGame';
import MultipleChoiceGame from '../components/games/MultipleChoiceGame';

/**
 * Games page - Contains all vocabulary learning games
 * Features: Multiple game types for different learning styles
 */
function Games() {
  const { words, getRandomWords } = useWords();
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameWords, setGameWords] = useState([]);

  const games = [
    {
      id: 'matching',
      title: 'משחק התאמה',
      description: 'גרור מילים באנגלית להתאמה עם התרגום העברי',
      component: MatchingGame,
      minWords: 4
    },
    {
      id: 'fill-blank',
      title: 'השלמת משפטים',
      description: 'בחר את המילה הנכונה להשלמת המשפט',
      component: FillInBlankGame,
      minWords: 3
    },
    {
      id: 'multiple-choice',
      title: 'בחירה מרובה',
      description: 'בחר את התרגום הנכון למילה באנגלית',
      component: MultipleChoiceGame,
      minWords: 4
    }
  ];

  const startGame = (gameType) => {
    const game = games.find(g => g.id === gameType);
    if (!game) return;

    const availableWords = words.filter(w => w.example && w.example.trim());
    if (availableWords.length < game.minWords) {
      alert(`נדרשות לפחות ${game.minWords} מילים עם משפטי דוגמה כדי לשחק במשחק זה`);
      return;
    }

    const selectedWords = getRandomWords(Math.min(8, availableWords.length));
    setGameWords(selectedWords);
    setSelectedGame(gameType);
  };

  const exitGame = () => {
    setSelectedGame(null);
    setGameWords([]);
  };

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    const GameComponent = game.component;
    
    return (
      <div className="page-container">
        <div className="game-container">
          <div className="game-header">
            <button 
              className="btn btn-secondary"
              onClick={exitGame}
            >
              ← חזור למשחקים
            </button>
            <h2 className="game-title">{game.title}</h2>
          </div>
          
          <GameComponent 
            words={gameWords}
            onExit={exitGame}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">משחקי לימוד</h1>
        <p className="page-subtitle">
          שפר את אוצר המילים שלך באמצעות משחקים מהנים ואינטראקטיביים
        </p>
      </div>

      {/* Game Selection */}
      {words.length === 0 ? (
        <div className="empty-state">
          <h3>עדיין לא הוספת מילים</h3>
          <p>כדי לשחק במשחקים, עליך להוסיף מילים לרשימה שלך קודם</p>
          <a href="/words" className="btn btn-primary mt-4">
            הוסף מילים
          </a>
        </div>
      ) : (
        <div className="games-grid">
          {games.map(game => {
            const availableWords = words.filter(w => 
              game.id === 'multiple-choice' ? true : w.example && w.example.trim()
            );
            const canPlay = availableWords.length >= game.minWords;
            
            return (
              <div key={game.id} className="game-card">
                <div className="game-card-header">
                  <h3 className="game-card-title">{game.title}</h3>
                </div>
                
                <div className="game-card-body">
                  <p className="game-description">{game.description}</p>
                  
                  <div className="game-requirements">
                    <div className="requirement-item">
                      <span className="requirement-label">מילים זמינות:</span>
                      <span className={`requirement-value ${canPlay ? 'success' : 'warning'}`}>
                        {availableWords.length}/{game.minWords}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="game-card-footer">
                  <button
                    className={`btn ${canPlay ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => startGame(game.id)}
                    disabled={!canPlay}
                  >
                    {canPlay ? 'התחל משחק' : 'לא מספיק מילים'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      {words.length > 0 && (
        <div className="game-stats mt-4">
          <h3>סטטיסטיקות מהירות</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{words.length}</span>
              <span className="stat-label">סך הכל מילים</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{words.filter(w => w.example).length}</span>
              <span className="stat-label">עם משפטי דוגמה</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{words.filter(w => w.status === 'learned').length}</span>
              <span className="stat-label">נלמדו</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Games;