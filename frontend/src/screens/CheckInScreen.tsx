import React, { useState, useEffect, useRef } from 'react';
import './CheckInScreen.css';
import SuccessAnimation from '../components/SuccessAnimation';
import { apiUrl } from '../utils/api';

interface Student {
  id: number;
  name: string;
  first_seen: string;
}

interface CheckInScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

const CheckInScreen: React.FC<CheckInScreenProps> = ({ onBack, onSuccess }) => {
  const [name, setName] = useState('');
  const [returningStudents, setReturningStudents] = useState<Student[]>([]);
  const [showReturning, setShowReturning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && !showReturning) {
      inputRef.current.focus();
    }
  }, [showReturning]);

  useEffect(() => {
    if (name.length > 0 && !showReturning) {
      searchStudents(name);
    } else if (!showReturning) {
      setReturningStudents([]);
    }
  }, [name, showReturning]);

  const searchStudents = async (query: string) => {
    try {
      const response = await fetch(apiUrl(`/api/students/search?q=${encodeURIComponent(query)}`));
      const data = await response.json();
      setReturningStudents(data);
    } catch (error) {
      console.error('Error searching students:', error);
    }
  };

  const loadAllStudents = async () => {
    try {
      const response = await fetch(apiUrl('/api/students'));
      const data = await response.json();
      setReturningStudents(data);
      setShowReturning(true);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleCheckIn = async (studentName?: string) => {
    const nameToUse = studentName || name.trim();
    
    if (!nameToUse) {
      setError('Please enter a name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(apiUrl('/api/checkin'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: nameToUse }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success animation
        setLoading(false);
        setShowSuccess(true);
      } else {
        setError(data.error || 'Failed to check in');
        setLoading(false);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setError('Failed to check in. Please try again.');
      setLoading(false);
    }
  };

  const handleReturningStudentClick = async (student: Student) => {
    if (loading) return;
    await handleCheckIn(student.name);
  };

  return (
    <>
      {showSuccess && (
        <SuccessAnimation
          message="Checked In Successfully!"
          onComplete={() => {
            setShowSuccess(false);
            onSuccess();
          }}
        />
      )}
      <div className="checkin-screen">
        <img src="/twss-logo.svg" alt="TWSS Logo" className="school-logo" />
      <div className="screen-header">
        <button className="back-button" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="screen-title">Check In</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="screen-content">
        {!showReturning ? (
          <>
            <div className="input-container">
              <label htmlFor="name-input" className="input-label">
                Enter your name
              </label>
              <input
                id="name-input"
                ref={inputRef}
                type="text"
                className="name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && name.trim()) {
                    handleCheckIn();
                  }
                }}
                placeholder="Type your name..."
                disabled={loading}
              />
            </div>

            <div style={{ minHeight: error ? '54px' : '0', transition: 'min-height 0.2s ease', flexShrink: 0 }}>
              {error && <div className="error-message">{error}</div>}
            </div>

            <div className="suggestions-section">
              {returningStudents.length > 0 && (
                <>
                  <div className="suggestions-label">Previous visitors</div>
                  <div className="suggestions-grid">
                    {returningStudents.map((student) => (
                      <button
                        key={student.id}
                        className="suggestion-card"
                        onClick={() => handleReturningStudentClick(student)}
                        disabled={loading}
                        type="button"
                      >
                        <div className="suggestion-avatar">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="suggestion-name">{student.name}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="actions-section">
              <button
                className="secondary-action-button"
                onClick={loadAllStudents}
                disabled={loading}
              >
                I've checked in before
              </button>
              <button
                className="primary-action-button"
                onClick={() => handleCheckIn()}
                disabled={loading || !name.trim()}
              >
                {loading ? 'Checking in...' : 'CHECK IN'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="returning-section">
              <div className="returning-title">Select your name</div>
              <div style={{ minHeight: error ? '54px' : '0', transition: 'min-height 0.2s ease', flexShrink: 0 }}>
                {error && <div className="error-message">{error}</div>}
              </div>
              <div className="returning-grid">
                {returningStudents.map((student) => (
                  <button
                    key={student.id}
                    className="returning-card"
                    onClick={() => handleReturningStudentClick(student)}
                    disabled={loading}
                    type="button"
                  >
                    <div className="returning-avatar">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="returning-name">{student.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="actions-section">
              <button
                className="secondary-action-button"
                onClick={() => {
                  setShowReturning(false);
                  setName('');
                }}
                disabled={loading}
              >
                New Student
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default CheckInScreen;

