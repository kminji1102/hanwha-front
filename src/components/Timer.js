import React, { useState, useEffect } from 'react';
import './Timer.css';

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20분을 초로 변환
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
      // 타이머 종료 시 알림
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('타이머 종료!', {
          body: '20분 타이머가 종료되었습니다.',
          icon: '/favicon.ico'
        });
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    setIsRunning(true);
    setIsCompleted(false);
  };

  const resetTimer = () => {
    setTimeLeft(20 * 60);
    setIsRunning(false);
    setIsCompleted(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((20 * 60 - timeLeft) / (20 * 60)) * 100;
  };

  return (
    <div className={`timer-container ${isCompleted ? 'completed' : ''}`}>
      <div className="timer-display">
        <div className="timer-time">{formatTime(timeLeft)}</div>
        <div className="timer-progress">
          <div 
            className="timer-progress-bar" 
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>
      
      <div className="timer-controls">
        {!isRunning && !isCompleted && (
          <button className="timer-btn start" onClick={startTimer}>
            시작
          </button>
        )}
        {isCompleted && (
          <button className="timer-btn reset" onClick={resetTimer}>
            다시 시작
          </button>
        )}
      </div>
      
      <div className="timer-status">
        {isCompleted && '종료!'}
      </div>
    </div>
  );
};

export default Timer; 