import React, { useState } from 'react';
import './CheckOutScreen.css';
import SuccessAnimation from '../components/SuccessAnimation';

interface CheckedInStudent {
  id: number;
  name: string;
  check_in_id: number;
  check_in_time: string;
}

interface CheckOutScreenProps {
  students: CheckedInStudent[];
  onBack: () => void;
  onSuccess: () => void;
}

const CheckOutScreen: React.FC<CheckOutScreenProps> = ({ students, onBack, onSuccess }) => {
  const [selectedStudent, setSelectedStudent] = useState<CheckedInStudent | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleStudentSelect = (student: CheckedInStudent) => {
    setSelectedStudent(student);
    setRating(null);
    setError('');
  };

  const handleRatingSelect = (value: number) => {
    setRating(value);
    setError('');
  };

  const handleCheckOut = async () => {
    if (!selectedStudent || !rating) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkInId: selectedStudent.check_in_id,
          rating: rating,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoading(false);
        setShowSuccess(true);
      } else {
        setError(data.error || 'Failed to check out');
        setLoading(false);
      }
    } catch (error) {
      setError('Failed to check out. Please try again.');
      setLoading(false);
    }
  };

  const getRatingLabel = (value: number) => {
    const labels = ['Not Helpful', 'Slightly Helpful', 'Moderately Helpful', 'Very Helpful', 'Extremely Helpful'];
    return labels[value - 1];
  };

  return (
    <>
      {showSuccess && (
        <SuccessAnimation
          message="Checked Out Successfully!"
          onComplete={() => {
            setShowSuccess(false);
            onSuccess();
          }}
        />
      )}
      <div className="checkout-screen">
        <img src="/twss-logo.svg" alt="TWSS Logo" className="school-logo" />
      <div className="screen-header">
        <button className="back-button" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="screen-title">Check Out</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="screen-content">
        {!selectedStudent ? (
          <>
            {students.length === 0 ? (
              <div className="empty-state">
                <div className="empty-title">No Active Sessions</div>
                <div className="empty-description">There are no students currently checked in</div>
              </div>
            ) : (
              <>
                <div className="students-list-header">
                  <h2 className="list-title">Select a student</h2>
                  <p className="list-subtitle">Tap to check out</p>
                </div>
                <div className="students-list">
                  {students.map((student) => (
                    <button
                      key={student.check_in_id}
                      className="student-card"
                      onClick={() => handleStudentSelect(student)}
                    >
                      <div className="student-card-avatar">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="student-card-info">
                        <div className="student-card-name">{student.name}</div>
                        <div className="student-card-time">
                          Checked in at {new Date(student.check_in_time).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="student-card-arrow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="selected-student-header">
              <div className="selected-avatar-large">
                {selectedStudent.name.charAt(0).toUpperCase()}
              </div>
              <div className="selected-name-large">{selectedStudent.name}</div>
            </div>

            <div className="rating-section">
              <h2 className="rating-title">How much did you learn today?</h2>
              <div className="rating-grid">
                {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      className={`rating-card ${rating === value ? 'selected' : ''}`}
                      onClick={() => handleRatingSelect(value)}
                      disabled={loading}
                    >
                      <div className="rating-number">{value}</div>
                      <div className="rating-label">{getRatingLabel(value)}</div>
                    </button>
                ))}
              </div>
            </div>

            <div style={{ minHeight: error ? '54px' : '0', transition: 'min-height 0.2s ease' }}>
              {error && <div className="error-message">{error}</div>}
            </div>

            <div className="actions-section">
              <button
                className="secondary-action-button"
                onClick={() => {
                  setSelectedStudent(null);
                  setRating(null);
                  setError('');
                }}
                disabled={loading}
              >
                Back
              </button>
              <button
                className="primary-action-button checkout-submit"
                onClick={handleCheckOut}
                disabled={loading || !rating}
              >
                {loading ? 'Checking out...' : 'Complete Check Out'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default CheckOutScreen;

