import React, { useState, useEffect } from 'react';
import { useWords } from '../../hooks/useWords';
import { speakWord } from '../../utils/speechSynthesis';

/**
 * Multiple Choice Game - Choose the correct Hebrew translation
 * Features: Multiple choice questions, immediate feedback, and scoring
 */
function MultipleChoiceGame({ words, onExit }) {
  const { updateWordProgress } = useWords();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Generate questions from words
  useEffect(() => {
    const generateQuestions = () => {
      const shuffledWords = [...words].sort(() => Math.random() - 0.5);
      
      const gameQuestions = shuffledWords.slice(0, 10).map(word => {
        // Generate wrong options
        const otherWords = words
          .filter(w => w.id !== word.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => w.hebrew);
        
        // Mix correct and wrong answers
        const options = [word.hebrew, ...otherWords]
          .sort(() => Math.random() - 0.5);
        
        return {
          id: word.id,
          english: word.english,
          correctAnswer: word.hebrew,
          options,
          example: word.example
        };
      });
      
      setQuestions(gameQuestions);
    };
    
    generateQuestions();
  }, [words]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || showFeedback) return;
    
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    updateWordProgress(currentQuestion.id, isCorrect, 'multiple-choice');
    setShowFeedback(true);
    
    // Auto-advance after feedback
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setGameCompleted(true);
      }
    }, 2000);
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setGameCompleted(false);
  };

  const playWordPronunciation = () => {
    if (currentQuestion) {
      speakWord(currentQuestion.english);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="game-loading">
        <p>טוען משחק...</p>
      </div>
    );
  }

  if (gameCompleted) {
    const successRate = Math.round((score / questions.length) * 100);
    
    return (
      <div className="game-completed">
        <div className="completion-header">
          <h2>משחק הושלם!</h2>
          <p>סיימת את משחק הבחירה המרובה</p>
        </div>
        
        <div className="completion-stats">
          <div className="stat-item">
            <span className="stat-number">{score}</span>
            <span className="stat-label">תשובות נכונות</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{questions.length}</span>
            <span className="stat-label">סך שאלות</span>
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
    <div className="multiple-choice-game-container">
      {/* Game Progress */}
      <div className="game-progress">
        <div className="progress-info">
          <span>שאלה {currentQuestionIndex + 1} מתוך {questions.length}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
        <div className="score-info">
          <span>ניקוד: {score}/{questions.length}</span>
        </div>
      </div>

      {/* Question */}
      <div className="question-container">
        <div className="question-header">
          <h3>מה הפירוש של המילה הזו?</h3>
        </div>
        
        <div className="word-display">
          <div className="question-word">
            <div className="english-word english-text">{currentQuestion.english}</div>
            <button 
              className="word-speaker-btn"
              onClick={playWordPronunciation}
              title="השמע הגייה"
            >
              השמע הגייה
            </button>
          </div>
        </div>
        
        {currentQuestion.example && (
          <div className="example-sentence">
            <p className="example-label">דוגמה:</p>
            <p className="example-text english-text">"{currentQuestion.example}"</p>
          </div>
        )}
      </div>

      {/* Answer Options */}
      <div className="answer-options">
        {currentQuestion.options.map((option, index) => {
          let className = 'answer-option';
          
          if (showFeedback) {
            if (option === currentQuestion.correctAnswer) {
              className += ' correct';
            } else if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
              className += ' incorrect';
            }
          } else if (option === selectedAnswer) {
            className += ' selected';
          }
          
          return (
            <button
              key={index}
              className={className}
              onClick={() => handleAnswerSelect(option)}
              disabled={showFeedback}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`feedback-container ${selectedAnswer === currentQuestion.correctAnswer ? 'correct' : 'incorrect'}`}>
          <div className="feedback-text">
            {selectedAnswer === currentQuestion.correctAnswer ? 
              'נכון! כל הכבוד!' : 
              'לא נכון.'
            }
          </div>
          <div className="feedback-explanation">
            <strong>{currentQuestion.english}</strong> = <strong>{currentQuestion.correctAnswer}</strong>
          </div>
          {currentQuestion.example && (
            <div className="feedback-example english-text">
              "{currentQuestion.example}"
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      {!showFeedback && (
        <div className="submit-container">
          <button
            className="btn btn-primary"
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
          >
            שלח תשובה
          </button>
        </div>
      )}

      {/* Game Actions */}
      <div className="game-actions">
        <button className="btn btn-secondary" onClick={onExit}>
          צא מהמשחק
        </button>
      </div>
    </div>
  );
}

export default MultipleChoiceGame;