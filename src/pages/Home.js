import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWords } from '../hooks/useWords';
import { speakWord } from '../utils/speechSynthesis';

/**
 * Home page - Landing page for Talk to Ori
 * Features: Hero section, animated words, teacher introduction, and navigation
 */
function Home() {
  const { words, getRandomWords } = useWords();
  const [currentWord, setCurrentWord] = useState(null);
  const [animatedWords, setAnimatedWords] = useState([]);

  // Animated word rotation
  useEffect(() => {
    if (words.length === 0) return;

    const interval = setInterval(() => {
      const randomWords = getRandomWords(1);
      if (randomWords.length > 0) {
        setCurrentWord(randomWords[0]);
      }
    }, 3000);

    // Set initial word
    const randomWords = getRandomWords(1);
    if (randomWords.length > 0) {
      setCurrentWord(randomWords[0]);
    }

    return () => clearInterval(interval);
  }, [words, getRandomWords]);

  // Floating words animation
  useEffect(() => {
    if (words.length === 0) return;

    const floatingWords = getRandomWords(6).map((word, index) => ({
      ...word,
      id: `floating-${index}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: index * 0.5
    }));
    
    setAnimatedWords(floatingWords);
  }, [words, getRandomWords]);

  const handleWordSpeak = (word) => {
    speakWord(word);
  };

  const stats = {
    totalWords: words.length,
    learned: words.filter(w => w.status === 'learned').length,
    successRate: words.length > 0 ? Math.round((words.filter(w => w.status === 'learned').length / words.length) * 100) : 0
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              שלום, אני <span className="highlight">אורי גרוס</span>
            </h1>
            <h2 className="hero-subtitle">
              לומד אנגלית עם תשוקה ונחישות
            </h2>
            <p className="hero-description">
              זהו המקום האישי שלי ללמוד אנגלית בצורה חכמה ומתקדמת. 
              כל מילה נשמרת, כל התקדמות נמדדת, וכל הצלחה נחגגת!
            </p>

            {currentWord && (
              <div className="current-word-showcase">
                <p className="showcase-label">המילה של הרגע:</p>
                <div className="word-display" onClick={() => handleWordSpeak(currentWord.english)}>
                  <span className="english-word">{currentWord.english}</span>
                  <span className="hebrew-word">{currentWord.hebrew}</span>
                  <button className="word-play-btn" title="השמע הגייה">
                    השמע
                  </button>
                </div>
              </div>
            )}

            <div className="hero-actions">
              <Link to="/words" className="btn btn-primary btn-large">
                התחל ללמוד
              </Link>
              <Link to="/games" className="btn btn-secondary btn-large">
                שחק ולמד
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="student-avatar">
              <div className="avatar-circle">
                <span className="avatar-text">אורי</span>
              </div>
              <div className="avatar-status">
                <span className="status-indicator"></span>
                לומד פעיל
              </div>
            </div>

            {/* Floating Words Animation */}
            <div className="floating-words">
              {animatedWords.map((word) => (
                <div
                  key={word.id}
                  className="floating-word"
                  style={{
                    left: `${word.x}%`,
                    top: `${word.y}%`,
                    animationDelay: `${word.delay}s`
                  }}
                  onClick={() => handleWordSpeak(word.english)}
                >
                  {word.english}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {words.length > 0 && (
        <section className="stats-section">
          <div className="container">
            <h3>המסע שלך עד כה</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{stats.totalWords}</div>
                <div className="stat-label">מילים במילון</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.learned}</div>
                <div className="stat-label">מילים נלמדו</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.successRate}%</div>
                <div className="stat-label">אחוז הצלחה</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
                      <h3>איך אורי לומד אנגלית?</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💭</div>
              <h4>למידה אישית</h4>
              <p>כל מילה נשמרת עם התרגום והקשר האישי שלך</p>
              <Link to="/words" className="feature-link">נהל מילים</Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎮</div>
              <h4>משחקים אינטראקטיביים</h4>
              <p>למד דרך משחקים מהנים שמחזקים את הזיכרון</p>
              <Link to="/games" className="feature-link">שחק עכשיו</Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏨</div>
              <h4>אנגלית לנסיעות</h4>
              <p>מילים מיוחדות למלונות ונסיעות בחו"ל</p>
              <Link to="/hotel-game" className="feature-link">משחק מלון</Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h4>סיפורים אישיים</h4>
              <p>הפוך את המילים שלך לסיפור מעניין ובלתי נשכח</p>
              <Link to="/story" className="feature-link">צור סיפור</Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4>מעקב התקדמות</h4>
              <p>ראה את השיפור שלך ובחן מילים שצריכות חיזוק</p>
              <Link to="/statistics" className="feature-link">ראה סטטיסטיקות</Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔊</div>
              <h4>הגייה מושלמת</h4>
              <p>שמע הגייה טבעית לכל מילה ושפר את הביטוי שלך</p>
              <div className="feature-link">טכנולוגיה מתקדמת</div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="getting-started-section">
        <div className="container">
          <h3>מוכן להתחיל?</h3>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h4>הוסף מילים</h4>
              <p>התחל בהוספת המילים שאתה רוצה ללמוד</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>שחק ולמד</h4>
              <p>השתמש במשחקים כדי להטמיע את המילים</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>עקוב אחר ההתקדמות</h4>
              <p>ראה איך אתה משתפר ואילו מילים לחזור עליהן</p>
            </div>
          </div>
          
          <div className="cta-container">
            {words.length === 0 ? (
              <Link to="/words" className="btn btn-primary btn-large cta-btn">
                הוסף את המילה הראשונה שלך
              </Link>
            ) : (
              <Link to="/games" className="btn btn-primary btn-large cta-btn">
                המשך ללמוד עם {words.length} מילים
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* About Ori Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <h3>על אורי גרוס</h3>
            <p>
              אורי הוא סטודנט נלהב שחיפש דרך יעילה ללמוד אנגלית. 
              הוא מאמין שלמידת שפה צריכה להיות אישית, מהנה ויעילה. 
              האפליקציה "Talk to Ori" נבנתה במיוחד עבורו - ללמוד אנגלית בצורה שמתאימה בדיוק לקצב ולסגנון הלמידה שלו.
            </p>
            <div className="about-highlights">
              <div className="highlight-item">
                ✓ למידה מותאמת אישית
              </div>
              <div className="highlight-item">
                ✓ מעקב התקדמות מתקדם
              </div>
              <div className="highlight-item">
                ✓ שימוש בטכנולוגיות חדשניות
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;