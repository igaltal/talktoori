import { useLocalStorageArray, useLocalStorage } from './useLocalStorage';

/**
 * Hook for managing vocabulary words
 * Handles CRUD operations, learning status, and statistics
 */
export function useWords() {
  const wordsStorage = useLocalStorageArray('talk-to-ori-words', []);
  const [wordStats, setWordStats] = useLocalStorage('talk-to-ori-word-stats', {});

  /**
   * Add a new word to the vocabulary
   */
  const addWord = (wordData) => {
    const word = {
      ...wordData,
      status: 'new', // new, learning, learned, weak
      timesCorrect: 0,
      timesIncorrect: 0,
      lastReviewed: null,
      difficulty: 'medium' // easy, medium, hard
    };
    
    return wordsStorage.addItem(word);
  };

  /**
   * Update word learning status and statistics
   */
  const updateWordProgress = (wordId, isCorrect, gameType = 'quiz') => {
    const word = wordsStorage.getItem(wordId);
    if (!word) return;

    const updates = {
      lastReviewed: new Date().toISOString(),
      timesCorrect: isCorrect ? word.timesCorrect + 1 : word.timesCorrect,
      timesIncorrect: isCorrect ? word.timesIncorrect : word.timesIncorrect + 1
    };

    // Update status based on performance
    const totalAttempts = updates.timesCorrect + updates.timesIncorrect;
    const successRate = updates.timesCorrect / totalAttempts;

    if (totalAttempts >= 3) {
      if (successRate >= 0.8) {
        updates.status = 'learned';
      } else if (successRate <= 0.4) {
        updates.status = 'weak';
      } else {
        updates.status = 'learning';
      }
    }

    wordsStorage.updateItem(wordId, updates);

    // Update daily statistics
    const today = new Date().toDateString();
    const currentStats = wordStats[today] || {
      quizzes: 0,
      correct: 0,
      timeSpent: 0,
      gamesPlayed: {}
    };

    const updatedStats = {
      ...currentStats,
      quizzes: currentStats.quizzes + 1,
      correct: isCorrect ? currentStats.correct + 1 : currentStats.correct,
      gamesPlayed: {
        ...currentStats.gamesPlayed,
        [gameType]: (currentStats.gamesPlayed[gameType] || 0) + 1
      }
    };

    setWordStats(prev => ({
      ...prev,
      [today]: updatedStats
    }));
  };

  /**
   * Mark word as learned manually
   */
  const markAsLearned = (wordId) => {
    wordsStorage.updateItem(wordId, { 
      status: 'learned',
      lastReviewed: new Date().toISOString()
    });
  };

  /**
   * Get words filtered by status
   */
  const getWordsByStatus = (status) => {
    return wordsStorage.items.filter(word => word.status === status);
  };

  /**
   * Get random words for games
   */
  const getRandomWords = (count = 5, excludeIds = []) => {
    const availableWords = wordsStorage.items.filter(word => 
      !excludeIds.includes(word.id)
    );
    
    const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  /**
   * Search words by English or Hebrew text
   */
  const searchWords = (query) => {
    if (!query.trim()) return wordsStorage.items;
    
    const lowerQuery = query.toLowerCase();
    return wordsStorage.items.filter(word => 
      word.english.toLowerCase().includes(lowerQuery) ||
      word.hebrew.includes(query) ||
      word.example.toLowerCase().includes(lowerQuery)
    );
  };

  /**
   * Get words for hotel/travel context
   */
  const getHotelWords = () => {
    const hotelKeywords = [
      'hotel', 'room', 'bed', 'bathroom', 'reception', 'lobby', 'check-in', 
      'check-out', 'key', 'elevator', 'restaurant', 'breakfast', 'service',
      'luggage', 'suitcase', 'travel', 'vacation', 'book', 'reservation',
      'guest', 'staff', 'clean', 'towel', 'shower', 'wifi', 'parking'
    ];

    return wordsStorage.items.filter(word => 
      hotelKeywords.some(keyword => 
        word.english.toLowerCase().includes(keyword) ||
        word.example.toLowerCase().includes(keyword)
      )
    );
  };

  /**
   * Get learning statistics
   */
  const getStatistics = () => {
    const words = wordsStorage.items;
    const learned = words.filter(w => w.status === 'learned').length;
    const learning = words.filter(w => w.status === 'learning').length;
    const weak = words.filter(w => w.status === 'weak').length;
    const newWords = words.filter(w => w.status === 'new').length;

    // Calculate weekly stats
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      const dayStats = wordStats[dateString] || { quizzes: 0, correct: 0, timeSpent: 0 };
      last7Days.push({
        date: dateString,
        ...dayStats,
        successRate: dayStats.quizzes > 0 ? (dayStats.correct / dayStats.quizzes * 100).toFixed(1) : 0
      });
    }

    // Get weak words (lowest success rate)
    const weakWords = words
      .filter(w => w.timesCorrect + w.timesIncorrect > 0)
      .map(w => ({
        ...w,
        successRate: w.timesCorrect / (w.timesCorrect + w.timesIncorrect)
      }))
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, 10);

    return {
      totalWords: words.length,
      learned,
      learning,
      weak,
      newWords,
      last7Days,
      weakWords,
      totalQuizzes: Object.values(wordStats).reduce((sum, day) => sum + (day.quizzes || 0), 0),
      totalCorrect: Object.values(wordStats).reduce((sum, day) => sum + (day.correct || 0), 0)
    };
  };

  return {
    words: wordsStorage.items,
    addWord,
    updateWord: wordsStorage.updateItem,
    deleteWord: wordsStorage.deleteItem,
    updateWordProgress,
    markAsLearned,
    getWordsByStatus,
    getRandomWords,
    searchWords,
    getHotelWords,
    getStatistics,
    clearAllWords: wordsStorage.clear
  };
}