import React, { useState, useEffect } from 'react';
import './App.css';
import HomeScreen from './screens/HomeScreen';
import CheckInScreen from './screens/CheckInScreen';
import CheckOutScreen from './screens/CheckOutScreen';

type Screen = 'home' | 'checkin' | 'checkout';

interface CheckedInStudent {
  id: number;
  name: string;
  check_in_id: number;
  check_in_time: string;
}

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [checkedInStudents, setCheckedInStudents] = useState<CheckedInStudent[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckedInStudents();
    // Refresh checked-in list every 5 seconds
    const interval = setInterval(fetchCheckedInStudents, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCheckedInStudents = async () => {
    try {
      const response = await fetch('/api/checked-in');
      const data = await response.json();
      setCheckedInStudents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching checked-in students:', error);
      setLoading(false);
    }
  };

  const handleCheckInSuccess = () => {
    fetchCheckedInStudents();
    setCurrentScreen('home');
  };

  const handleCheckOutSuccess = () => {
    fetchCheckedInStudents();
    setCurrentScreen('home');
  };

  return (
    <div className="app">
      <div className="screen-container">
        {currentScreen === 'home' && (
          <div className="screen-wrapper active">
            <HomeScreen
              checkedInCount={checkedInStudents.length}
              onCheckIn={() => setCurrentScreen('checkin')}
              onCheckOut={() => setCurrentScreen('checkout')}
              canCheckOut={checkedInStudents.length > 0}
            />
          </div>
        )}

        {currentScreen === 'checkin' && (
          <div className="screen-wrapper active">
            <CheckInScreen
              onBack={() => setCurrentScreen('home')}
              onSuccess={handleCheckInSuccess}
            />
          </div>
        )}

        {currentScreen === 'checkout' && (
          <div className="screen-wrapper active">
            <CheckOutScreen
              students={checkedInStudents}
              onBack={() => setCurrentScreen('home')}
              onSuccess={handleCheckOutSuccess}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

