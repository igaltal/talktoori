import React, { useState, useEffect } from 'react';
import { useWords } from '../../hooks/useWords';
import { speakSentence, speakWord } from '../../utils/speechSynthesis';

/**
 * Fill in the Blank Game - Complete sentences by choosing the correct word
 * Features: Sentence completion, multiple choice, and pronunciation
 */
function FillInBlankGame({ words, onExit }) {
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
      const wordsWithExamples = words.filter(word => 
        word.example && word.example.trim().length > 0
      );
      
      const gameQuestions = wordsWithExamples.slice(0, 8).map(word => {
        // Create a sentence with a blank
        const sentence = word.example;
        const wordToReplace = word.english;
        const blankSentence = sentence.replace(
          new RegExp(`\\b${wordToReplace}\\b`, 'gi'), 
          '____'
        );
        
        // Generate wrong options
        const otherWords = words
          .filter(w => w.id !== word.id && w.english.length > 2)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => w.english);
        
        // Mix correct and wrong answers
        const options = [word.english, ...otherWords]
          .sort(() => Math.random() - 0.5);
        
        return {
          id: word.id,
          sentence: blankSentence,
          correctAnswer: word.english,
          options,
          hebrew: word.hebrew,
          fullSentence: sentence
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
    
    updateWordProgress(currentQuestion.id, isCorrect, 'fill-blank');
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
    }, 2500);
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setGameCompleted(false);
  };

  const playFullSentence = () => {
    if (currentQuestion) {
      speakSentence(currentQuestion.fullSentence);
    }
  };

  const playWord = (word) => {
    speakWord(word);
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
          <p>סיימת את משחק השלמת המשפטים</p>
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
    <div className="fill-blank-game-container">
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
          <h3>השלם את המשפט:</h3>
          <button 
            className="btn btn-sm btn-secondary"
            onClick={playFullSentence}
            title="השמע משפט מלא"
          >
            השמע משפט מלא
          </button>
        </div>
        
        <div className="sentence-display">
          <p className="sentence-text english-text">
            {currentQuestion.sentence}
          </p>
        </div>
        
        <div className="word-meaning">
          <p><strong>המילה החסרה פירושה:</strong> {currentQuestion.hebrew}</p>
        </div>
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
            <div
              key={index}
              className={`answer-option-container ${className}`}
            >
              <button
                className="answer-option-main"
                onClick={() => handleAnswerSelect(option)}
                disabled={showFeedback}
              >
                <span className="english-text">{option}</span>
              </button>
              <button 
                className="option-speaker-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  playWord(option);
                }}
                title="השמע הגייה"
              >
                השמע
              </button>
            </div>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`feedback-container ${selectedAnswer === currentQuestion.correctAnswer ? 'correct' : 'incorrect'}`}>
          <div className="feedback-text">
            {selectedAnswer === currentQuestion.correctAnswer ? 
              'נכון! כל הכבוד!' : 
              'לא נכון. התשובה הנכונה היא:'
            }
          </div>
          {selectedAnswer !== currentQuestion.correctAnswer && (
            <div className="correct-answer">
              <span className="english-text">{currentQuestion.correctAnswer}</span>
              <button 
                className="speaker-btn"
                onClick={() => playWord(currentQuestion.correctAnswer)}
              >
                השמע
              </button>
            </div>
          )}
          <div className="full-sentence english-text">
            "{currentQuestion.fullSentence}"
          </div>
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

export default FillInBlankGame;