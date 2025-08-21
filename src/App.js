import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import Timer from './components/Timer';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showAYDPopup, setShowAYDPopup] = useState(false);

  useEffect(() => {
    // 로컬 스토리지에서 토큰 확인
    const token = localStorage.getItem('token');
    if (token) {
      // 토큰이 있으면 로그인 상태로 설정
      setIsLoggedIn(true);
      // 사용자 정보 설정 (ID 기록 없이 기본값 사용)
      setUserInfo({
        nickname: '사용자'
      });
    }
  }, []);

  const handleLoginSuccess = useCallback((userData) => {
    setIsLoggedIn(true);
    setUserInfo(userData);
    // AYD 팝업 표시
    setShowAYDPopup(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserInfo(null);
  }, []);

  const handleCloseAYD = useCallback(() => {
    setShowAYDPopup(false);
  }, []);

  return (
    <div className="App">
      {/* 타이머는 모든 화면에서 표시 */}
      <Timer onLogout={handleLogout} />
      
      {isLoggedIn ? (
        <HomePage 
          userInfo={userInfo} 
          onLogout={handleLogout}
          token={localStorage.getItem('token')}
        />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
      
      {/* AYD 팝업은 로그인 성공 후에만 표시 */}
      {showAYDPopup && (
        <div className="ayd-popup-overlay">
          {/* AYD 팝업 컴포넌트는 LoginPage에서 관리하므로 여기서는 제거 */}
        </div>
      )}
    </div>
  );
}

export default App;
