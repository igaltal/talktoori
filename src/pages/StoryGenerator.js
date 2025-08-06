import React, { useState, useEffect, useCallback } from 'react';
import { useWords } from '../hooks/useWords';
import { speakSentence } from '../utils/speechSynthesis';

/**
 * Story Generator - Creates personalized stories using user's vocabulary
 * Features: Random word selection, story templates, and natural reading
 */
function StoryGenerator() {
  const { words, getRandomWords } = useWords();
  const [currentStory, setCurrentStory] = useState(null);
  const [storyWords, setStoryWords] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyHistory, setStoryHistory] = useState([]);

  // Story templates with placeholders
  const storyTemplates = [
    {
      id: 1,
      template: "Yesterday, I went to the {location} and saw a {adjective} {noun}. It reminded me of {memory} when I was {feeling}. The {person} there told me about {object}, which made me {emotion}.",
      requiredTypes: ['location', 'adjective', 'noun', 'memory', 'feeling', 'person', 'object', 'emotion']
    },
    {
      id: 2,
      template: "Last week, I discovered something {adjective} in my {location}. It was a {noun} that belonged to {person}. When I {action} it, I felt {emotion} because it reminded me of {memory}.",
      requiredTypes: ['adjective', 'location', 'noun', 'person', 'action', 'emotion', 'memory']
    },
    {
      id: 3,
      template: "Every morning, I {action} to the {location} where I meet my {person}. Today was different because I found a {adjective} {object}. It made me feel {emotion} and think about {memory}.",
      requiredTypes: ['action', 'location', 'person', 'adjective', 'object', 'emotion', 'memory']
    },
    {
      id: 4,
      template: "During my vacation, I stayed at a {adjective} hotel. The {person} was very {feeling}, and the {object} in my room was {adjective2}. I spent my time {action} and feeling {emotion}.",
      requiredTypes: ['adjective', 'person', 'feeling', 'object', 'adjective2', 'action', 'emotion']
    },
    {
      id: 5,
      template: "I remember when I first learned the word '{word}'. I was at {location}, feeling {emotion}. A {person} helped me understand it by showing me a {object}. Now, whenever I {action}, I think of that {adjective} moment.",
      requiredTypes: ['word', 'location', 'emotion', 'person', 'object', 'action', 'adjective']
    }
  ];

  // Generate a story using random words
  const generateStory = useCallback(() => {
    if (words.length < 5) {
      alert('נדרשות לפחות 5 מילים כדי ליצור סיפור');
      return;
    }

    setIsGenerating(true);

    // Select random template
    const template = storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
    
    // Get random words for the story
    const selectedWords = getRandomWords(Math.min(8, words.length));
    
    // Create word mappings for placeholders
    const wordMappings = {};
    const shuffledWords = [...selectedWords].sort(() => Math.random() - 0.5);
    
    // Fill placeholders with actual words
    template.requiredTypes.forEach((type, index) => {
      const word = shuffledWords[index % shuffledWords.length];
      wordMappings[type] = word.english;
    });

    // Replace placeholders in template
    let storyText = template.template;
    Object.keys(wordMappings).forEach(placeholder => {
      const regex = new RegExp(`{${placeholder}}`, 'g');
      storyText = storyText.replace(regex, wordMappings[placeholder]);
    });

    const story = {
      id: Date.now(),
      text: storyText,
      words: selectedWords,
      wordMappings,
      template: template.id,
      createdAt: new Date().toISOString()
    };

    setCurrentStory(story);
    setStoryWords(selectedWords);
    
    // Add to history
    setStoryHistory(prev => [story, ...prev.slice(0, 4)]); // Keep last 5 stories
    
    setTimeout(() => {
      setIsGenerating(false);
    }, 500);
  }, [words, getRandomWords, storyTemplates]);

  // Highlight words in story
  const renderStoryWithHighlights = (storyText, wordsToHighlight) => {
    if (!wordsToHighlight) return storyText;
    
    let highlightedText = storyText;
    wordsToHighlight.forEach(word => {
      const regex = new RegExp(`\\b${word.english}\\b`, 'gi');
      highlightedText = highlightedText.replace(
        regex, 
        `<mark class="highlighted-word" title="${word.hebrew}">${word.english}</mark>`
      );
    });
    
    return highlightedText;
  };

  // Read story aloud
  const readStoryAloud = () => {
    if (currentStory) {
      speakSentence(currentStory.text);
    }
  };

  // Load a story from history
  const loadHistoryStory = (story) => {
    setCurrentStory(story);
    setStoryWords(story.words);
  };

  // Generate initial story on component mount
  useEffect(() => {
    if (words.length >= 5 && !currentStory) {
      generateStory();
    }
  }, [words, currentStory, generateStory]);

  if (words.length < 5) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">מחולל סיפורים </h1>
          <p className="page-subtitle">
            צור סיפורים אישיים באמצעות אוצר המילים שלך
          </p>
        </div>
        
        <div className="empty-state">
          <h3>נדרשות לפחות 5 מילים</h3>
          <p>כדי ליצור סיפורים, עליך להוסיף עוד מילים לרשימה שלך</p>
          <a href="/words" className="btn btn-primary mt-4">
            הוסף מילים
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">מחולל סיפורים </h1>
        <p className="page-subtitle">
          סיפורים אישיים הנבנים מאוצר המילים שלך
        </p>
      </div>

      {/* Story Statistics */}
      <div className="story-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{words.length}</span>
            <span className="stat-label">מילים זמינות</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{storyHistory.length}</span>
            <span className="stat-label">סיפורים שנוצרו</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{storyWords.length}</span>
            <span className="stat-label">מילים בסיפור הנוכחי</span>
          </div>
        </div>
      </div>

      {/* Current Story */}
      {currentStory && (
        <div className="story-container">
          <div className="story-header">
            <h2>הסיפור שלך</h2>
            <div className="story-controls">
              <button 
                className="btn btn-primary"
                onClick={readStoryAloud}
                title="השמע סיפור"
                                >
                    השמע סיפור
                  </button>
              <button 
                className="btn btn-secondary"
                onClick={generateStory}
                disabled={isGenerating}
              >
                {isGenerating ? '...יוצר' : 'צור סיפור חדש'}
              </button>
            </div>
          </div>
          
          <div className="story-content">
            <div 
              className="story-text"
              dangerouslySetInnerHTML={{ 
                __html: renderStoryWithHighlights(currentStory.text, storyWords) 
              }}
            />
          </div>
          
          <div className="story-info">
            <p><strong>הסבר:</strong> המילים המסומנות צהוב הן מאוצר המילים שלך. רחף עליהן כדי לראות את התרגום לעברית.</p>
          </div>
        </div>
      )}

      {/* Words Used in Current Story */}
      {storyWords.length > 0 && (
        <div className="story-words-section">
          <h3>המילים בסיפור</h3>
          <div className="story-words-grid">
            {storyWords.map(word => (
              <div key={word.id} className="story-word-card">
                <div className="word-pair">
                  <span className="english-text">{word.english}</span>
                  <span className="hebrew-text">{word.hebrew}</span>
                </div>
                {word.example && (
                  <div className="word-example">
                    <small className="english-text">"{word.example}"</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Story History */}
      {storyHistory.length > 1 && (
        <div className="story-history-section">
          <h3>סיפורים קודמים</h3>
          <div className="history-stories">
            {storyHistory.slice(1).map((story, index) => (
              <div key={story.id} className="history-story-card">
                <div className="history-story-preview">
                  <p className="english-text">
                    {story.text.substring(0, 100)}...
                  </p>
                </div>
                <div className="history-story-meta">
                  <span className="story-date">
                    {new Date(story.createdAt).toLocaleDateString('he-IL')}
                  </span>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => loadHistoryStory(story)}
                  >
                    טען סיפור
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="story-tips">
        <h4>טיפים לשיפור הסיפורים</h4>
        <ul>
          <li>הוסף מילים עם משפטי דוגמה למגוון רב יותר</li>
          <li>כלול מילים מסוגים שונים: פעלים, שמות עצם, תארים</li>
          <li>הסיפורים נבנים באופן אקראי - כל יצירה תיתן תוצאה שונה</li>
          <li>השתמש בכפתור ההשמעה כדי לתרגל הגייה</li>
        </ul>
      </div>
    </div>
  );
}

export default StoryGenerator;