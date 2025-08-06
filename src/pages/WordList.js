import React, { useState, useMemo } from 'react';
import { useWords } from '../hooks/useWords';
import WordCard from '../components/WordCard';
import AddWordModal from '../components/AddWordModal';

/**
 * WordList page - Main page for vocabulary management
 * Features: Add, search, filter, and manage vocabulary words
 */
function WordList() {
  const { words, addWord, deleteWord, markAsLearned, searchWords } = useWords();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('alphabetical');

  // Filter and sort words
  const filteredWords = useMemo(() => {
    let filtered = searchQuery ? searchWords(searchQuery) : words;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(word => word.status === statusFilter);
    }
    
    // Sort words
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.english.localeCompare(b.english);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'most-reviewed':
          const aTotal = (a.timesCorrect || 0) + (a.timesIncorrect || 0);
          const bTotal = (b.timesCorrect || 0) + (b.timesIncorrect || 0);
          return bTotal - aTotal;
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [words, searchQuery, statusFilter, sortBy, searchWords]);

  const handleAddWord = (wordData) => {
    addWord(wordData);
    setIsAddModalOpen(false);
  };

  const getStatusCounts = () => {
    return {
      all: words.length,
      new: words.filter(w => w.status === 'new').length,
      learning: words.filter(w => w.status === 'learning').length,
      learned: words.filter(w => w.status === 'learned').length,
      weak: words.filter(w => w.status === 'weak').length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">רשימת המילים שלי</h1>
        <p className="page-subtitle">
          נהל את אוצר המילים שלך באנגלית. הוסף מילים חדשות, חפש וסנן לפי סטטוס
        </p>
      </div>

      {/* Quick Stats */}
      <div className="stats-overview mb-4">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{statusCounts.all}</span>
            <span className="stat-label">סך הכל מילים</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{statusCounts.learned}</span>
            <span className="stat-label">נלמדו</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{statusCounts.learning}</span>
            <span className="stat-label">בתהליך לימוד</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{statusCounts.weak}</span>
            <span className="stat-label">צריכות חיזוק</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section mb-4">
        <div className="search-filters">
          {/* Search */}
          <div className="search-input">
            <input
              type="text"
              className="form-input"
              placeholder="חפש מילה באנגלית או בעברית..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="filter-buttons">
            {[
              { key: 'all', label: 'הכל', count: statusCounts.all },
              { key: 'new', label: 'חדשות', count: statusCounts.new },
              { key: 'learning', label: 'בלימוד', count: statusCounts.learning },
              { key: 'learned', label: 'נלמדו', count: statusCounts.learned },
              { key: 'weak', label: 'חלשות', count: statusCounts.weak }
            ].map(filter => (
              <button
                key={filter.key}
                className={`filter-btn ${statusFilter === filter.key ? 'active' : ''}`}
                onClick={() => setStatusFilter(filter.key)}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Sort and Add */}
        <div className="toolbar">
          <select
            className="form-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="alphabetical">מיון אלפביתי</option>
            <option value="newest">החדשות ביותר</option>
            <option value="oldest">הישנות ביותר</option>
            <option value="most-reviewed">הכי נסקרו</option>
          </select>

          <button
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            הוסף מילה חדשה
          </button>
        </div>
      </div>

      {/* Words Grid */}
      {filteredWords.length === 0 ? (
        <div className="empty-state">
          {words.length === 0 ? (
            <>
              <h3>עדיין לא הוספת מילים</h3>
              <p>התחל ללמוד אנגלית על ידי הוספת המילה הראשונה שלך!</p>
              <button
                className="btn btn-primary mt-4"
                onClick={() => setIsAddModalOpen(true)}
              >
                הוסף מילה ראשונה
              </button>
            </>
          ) : (
            <>
              <h3>לא נמצאו מילים</h3>
              <p>נסה לשנות את תנאי החיפוש או הסינון</p>
            </>
          )}
        </div>
      ) : (
        <div className="words-grid">
          {filteredWords.map(word => (
            <WordCard
              key={word.id}
              word={word}
              onDelete={() => deleteWord(word.id)}
              onMarkLearned={() => markAsLearned(word.id)}
            />
          ))}
        </div>
      )}

      {/* Add Word Modal */}
      {isAddModalOpen && (
        <AddWordModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddWord}
        />
      )}
    </div>
  );
}

export default WordList;