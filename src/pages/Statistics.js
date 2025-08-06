import React from 'react';
import { useWords } from '../hooks/useWords';

/**
 * Statistics page - Learning progress and analytics
 * Features: Progress tracking, performance metrics, and learning insights
 */
function Statistics() {
  const { words, getStatistics } = useWords();
  const stats = getStatistics();

  const formatSuccessRate = (correct, total) => {
    if (total === 0) return '0%';
    return Math.round((correct / total) * 100) + '%';
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'היום';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'אתמול';
    } else {
      return date.toLocaleDateString('he-IL', { weekday: 'short' });
    }
  };

  if (words.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">סטטיסטיקות</h1>
          <p className="page-subtitle">
            עקוב אחר ההתקדמות שלך בלמידת אנגלית
          </p>
        </div>
        
        <div className="empty-state">
          <h3>עדיין לא התחלת ללמוד</h3>
          <p>כשתתחיל להוסיף מילים ולשחק במשחקים, תוכל לראות כאן את ההתקדמות שלך</p>
          <a href="/words" className="btn btn-primary mt-4">
            התחל ללמוד
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">סטטיסטיקות למידה</h1>
        <p className="page-subtitle">
          מעקב אחר ההתקדמות וההישגים שלך
        </p>
      </div>

      {/* Overall Statistics */}
      <div className="stats-overview">
        <h2>סקירה כללית</h2>
        <div className="stats-grid">
          <div className="stat-card primary">
            <span className="stat-number">{stats.totalWords}</span>
            <span className="stat-label">סך הכל מילים</span>
            <span className="stat-trend">במילון שלך</span>
          </div>
          
          <div className="stat-card success">
            <span className="stat-number">{stats.learned}</span>
            <span className="stat-label">מילים נלמדו</span>
            <span className="stat-trend">
              {stats.totalWords > 0 ? Math.round((stats.learned / stats.totalWords) * 100) : 0}% מהמילון
            </span>
          </div>
          
          <div className="stat-card warning">
            <span className="stat-number">{stats.learning}</span>
            <span className="stat-label">בתהליך לימוד</span>
            <span className="stat-trend">זקוקות לתרגול נוסף</span>
          </div>
          
          <div className="stat-card danger">
            <span className="stat-number">{stats.weak}</span>
            <span className="stat-label">מילים חלשות</span>
            <span className="stat-trend">דורשות תשומת לב</span>
          </div>
        </div>
      </div>

      {/* Quiz Performance */}
      <div className="quiz-performance">
        <h2>ביצועים במשחקים</h2>
        <div className="performance-cards">
          <div className="performance-card">
            <div className="performance-header">
              <h3>סך הניסיונות</h3>
              <span className="performance-number">{stats.totalQuizzes}</span>
            </div>
            <div className="performance-body">
              <div className="performance-breakdown">
                <div className="breakdown-item success">
                  <span className="breakdown-label">תשובות נכונות</span>
                  <span className="breakdown-value">{stats.totalCorrect}</span>
                </div>
                <div className="breakdown-item danger">
                  <span className="breakdown-label">תשובות שגויות</span>
                  <span className="breakdown-value">{stats.totalQuizzes - stats.totalCorrect}</span>
                </div>
              </div>
              <div className="success-rate">
                <span className="rate-label">אחוז הצלחה כללי:</span>
                <span className="rate-value">
                  {formatSuccessRate(stats.totalCorrect, stats.totalQuizzes)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="weekly-progress">
        <h2>התקדמות שבועית</h2>
        <div className="progress-chart">
          <div className="chart-header">
            <h3>7 ימים אחרונים</h3>
            <p>פעילות יומית ואחוזי הצלחה</p>
          </div>
          <div className="chart-body">
            {stats.last7Days.map((day, index) => (
              <div key={index} className="day-stat">
                <div className="day-header">
                  <span className="day-name">{getDayName(day.date)}</span>
                  <span className="day-date">
                    {new Date(day.date).toLocaleDateString('he-IL', { 
                      month: 'numeric', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="day-metrics">
                  <div className="metric">
                    <span className="metric-label">שאלות</span>
                    <span className="metric-value">{day.quizzes}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">נכונות</span>
                    <span className="metric-value">{day.correct}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">הצלחה</span>
                    <span className="metric-value">{day.successRate}%</span>
                  </div>
                </div>
                <div className="day-progress-bar">
                  <div 
                    className="day-progress-fill"
                    style={{ 
                      width: `${Math.min(100, (day.quizzes / 10) * 100)}%`,
                      backgroundColor: day.quizzes === 0 ? '#e5e7eb' : '#10b981'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weak Words Section */}
      {stats.weakWords.length > 0 && (
        <div className="weak-words-section">
          <h2>מילים לחיזוק</h2>
          <p className="section-description">
            המילים הבאות צריכות תרגול נוסף. התמקד בהן במשחקים הבאים:
          </p>
          <div className="weak-words-grid">
            {stats.weakWords.slice(0, 8).map(word => (
              <div key={word.id} className="weak-word-card">
                <div className="word-info">
                  <span className="english-text">{word.english}</span>
                  <span className="hebrew-text">{word.hebrew}</span>
                </div>
                <div className="word-stats">
                  <div className="attempts">
                    <span className="attempts-label">ניסיונות:</span>
                    <span className="attempts-value">
                      {(word.timesCorrect || 0) + (word.timesIncorrect || 0)}
                    </span>
                  </div>
                  <div className="success-rate">
                    <span className="rate-value">
                      {Math.round((word.successRate || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="weak-words-actions">
            <a href="/games" className="btn btn-primary">
              תרגל מילים אלה במשחקים
            </a>
          </div>
        </div>
      )}

      {/* Learning Tips */}
      <div className="learning-tips">
        <h2>טיפים לשיפור</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon"></div>
            <h4>תרגול יומי</h4>
            <p>נסה לענות על לפחות 10 שאלות ביום כדי לשפר את הזיכרון</p>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon"></div>
            <h4>חזרה על מילים חלשות</h4>
            <p>התמקד במילים עם אחוז הצלחה נמוך להשיג שיפור מהיר</p>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon"></div>
            <h4>הוספת מילים חדשות</h4>
            <p>הוסף 2-3 מילים חדשות בשבוע כדי להרחיב את אוצר המילים</p>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon"></div>
            <h4>מגוון משחקים</h4>
            <p>שחק במשחקים שונים כדי לתרגל מיומנויות שונות</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;