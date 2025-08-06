import React, { useState } from 'react';
import { speakWord } from '../utils/speechSynthesis';

/**
 * Modal component for adding new vocabulary words
 * Features: form validation, pronunciation preview, and submission
 */
function AddWordModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    english: '',
    hebrew: '',
    example: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.english.trim()) {
      newErrors.english = 'נדרשת מילה באנגלית';
    } else if (!/^[a-zA-Z\s\-']+$/.test(formData.english.trim())) {
      newErrors.english = 'המילה באנגלית חייבת להכיל רק אותיות אנגליות';
    }
    
    if (!formData.hebrew.trim()) {
      newErrors.hebrew = 'נדרש תרגום לעברית';
    }
    
    if (formData.example && formData.example.length > 200) {
      newErrors.example = 'המשפט לדוגמה ארוך מדי (מקסימום 200 תווים)';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const wordData = {
        english: formData.english.trim().toLowerCase(),
        hebrew: formData.hebrew.trim(),
        example: formData.example.trim()
      };
      
      onAdd(wordData);
    } catch (error) {
      console.error('Error adding word:', error);
      setErrors({ submit: 'שגיאה בהוספת המילה. אנא נסה שוב.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewPronunciation = async () => {
    if (formData.english.trim()) {
      try {
        await speakWord(formData.english.trim());
      } catch (error) {
        console.error('Speech error:', error);
      }
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">הוסף מילה חדשה</h2>
          <button
            className="modal-close"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* English Word */}
          <div className="form-group">
            <label className="form-label" htmlFor="english">
              מילה באנגלית *
            </label>
                        <div className="english-input-container">
              <input
                id="english"
                type="text"
                className={`form-input english ${errors.english ? 'error' : ''}`}
                value={formData.english}
                onChange={(e) => handleInputChange('english', e.target.value)}
                placeholder="לדוגמה: beautiful"
                autoFocus
              />
              {formData.english && (
                <button
                  type="button"
                  className="pronunciation-preview-btn"
                  onClick={handlePreviewPronunciation}
                  title="השמע הגייה"
                  >
                    השמע הגייה
                  </button>
              )}
            </div>
            {errors.english && (
              <span className="error-message">{errors.english}</span>
            )}
          </div>

          {/* Hebrew Translation */}
          <div className="form-group">
            <label className="form-label" htmlFor="hebrew">
              תרגום לעברית *
            </label>
            <input
              id="hebrew"
              type="text"
              className={`form-input ${errors.hebrew ? 'error' : ''}`}
              value={formData.hebrew}
              onChange={(e) => handleInputChange('hebrew', e.target.value)}
              placeholder="לדוגמה: יפה"
            />
            {errors.hebrew && (
              <span className="error-message">{errors.hebrew}</span>
            )}
          </div>

          {/* Example Sentence */}
          <div className="form-group">
            <label className="form-label" htmlFor="example">
              משפט לדוגמה (אופציונלי)
            </label>
            <textarea
              id="example"
              className={`form-input english ${errors.example ? 'error' : ''}`}
              value={formData.example}
              onChange={(e) => handleInputChange('example', e.target.value)}
              placeholder="She is a beautiful person"
              rows={3}
              maxLength={200}
            />
            <div className="char-count">
              {formData.example.length}/200
            </div>
            {errors.example && (
              <span className="error-message">{errors.example}</span>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'מוסיף...' : 'הוסף מילה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddWordModal;