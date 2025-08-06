import React, { useState } from 'react';
import { speakWord } from '../utils/speechSynthesis';

/**
 * WordCard component for displaying individual vocabulary words
 * Features: pronunciation, status display, and quick actions
 */
function WordCard({ word, onDelete, onMarkLearned }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = async () => {
    if (isPlaying) return;
    
    try {
      setIsPlaying(true);
      await speakWord(word.english);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      new: { label: 'חדש', className: 'status-new' },
      learning: { label: 'בלימוד', className: 'status-learning' },
      learned: { label: 'נלמד', className: 'status-learned' },
      weak: { label: 'חלש', className: 'status-weak' }
    };
    return statusMap[status] || statusMap.new;
  };

  const statusInfo = getStatusInfo(word.status);
  const totalAttempts = (word.timesCorrect || 0) + (word.timesIncorrect || 0);
  const successRate = totalAttempts > 0 ? Math.round((word.timesCorrect || 0) / totalAttempts * 100) : 0;

  return (
    <div className="word-card">
      <div className="word-card-header">
        <div className="word-status">
          <span className={`word-status-badge ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
        <div className="word-actions">
          <button
            className={`speaker-btn ${isPlaying ? 'playing' : ''}`}
            onClick={handleSpeak}
            disabled={isPlaying}
            title="השמע הגייה"
          >
            {isPlaying ? 'נגן' : 'השמע'}
          </button>
        </div>
      </div>

      <div className="word-card-body">
        <div className="word-content">
          <h3 className="word-english english-text">{word.english}</h3>
          <p className="word-hebrew">{word.hebrew}</p>
          {word.example && (
            <p className="word-example english-text">"{word.example}"</p>
          )}
        </div>

        {/* Statistics */}
        {totalAttempts > 0 && (
          <div className="word-stats">
            <div className="stats-row">
              <span className="stat-item">
                <strong>{successRate}%</strong> הצלחה
              </span>
              <span className="stat-item">
                <strong>{totalAttempts}</strong> ניסיונות
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="word-card-actions">
          {word.status !== 'learned' && (
            <button
              className="btn btn-success btn-sm"
              onClick={onMarkLearned}
                          >
                סמן כנלמד
              </button>
          )}
          <button
            className="btn btn-danger btn-sm"
            onClick={onDelete}
          >
            מחק
          </button>
        </div>

        {/* Last reviewed */}
        {word.lastReviewed && (
          <div className="word-meta">
            <small className="text-sm text-gray-500">
              נסקר לאחרונה: {new Date(word.lastReviewed).toLocaleDateString('he-IL')}
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

export default WordCard;