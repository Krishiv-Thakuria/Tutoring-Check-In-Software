import React from 'react';
import './HomeScreen.css';

interface HomeScreenProps {
  checkedInCount: number;
  onCheckIn: () => void;
  onCheckOut: () => void;
  canCheckOut: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ checkedInCount, onCheckIn, onCheckOut, canCheckOut }) => {
  return (
    <div className="home-screen">
      <img src="/twss-logo.svg" alt="TWSS Logo" className="school-logo" />
      <div className="home-content">
        <header className="home-header">
          <h1 className="home-title">Peer Tutoring Center</h1>
        </header>

        <div className="actions-grid">
          <button
            className="action-card check-in-card"
            onClick={onCheckIn}
          >
            <h2 className="card-title">Check In</h2>
          </button>

          <button
            className="action-card check-out-card"
            onClick={onCheckOut}
            disabled={!canCheckOut}
          >
            <h2 className="card-title">Check Out</h2>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;

