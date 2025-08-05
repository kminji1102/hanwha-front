import React from 'react';
import './HomePage.css';

const HomePage = ({ userInfo, onLogout }) => {
  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1 className="welcome-title">환영합니다!</h1>
          <div className="user-info">
            <span className="user-name">{userInfo.nickname}</span>
            <button className="logout-btn" onClick={onLogout}>
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="dashboard">
          <div className="user-dashboard">
            <div className="dashboard-card">
              <h3>사용자 정보</h3>
              <div className="user-details">
                <p><strong>닉네임:</strong> {userInfo.nickname}</p>
                <p><strong>로그인 시간:</strong> {new Date().toLocaleString('ko-KR')}</p>
              </div>
            </div>

            <div className="dashboard-card">
              <h3>퀴즈 완료</h3>
              <div className="quiz-status">
                <p>Are You Developer? 퀴즈를 성공적으로 완료했습니다! 🎉</p>
                <div className="achievement">
                  <span className="achievement-icon">🏆</span>
                  <span>개발자 자격 인증 완료</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <h3>오늘의 할 일</h3>
              <div className="todo-list">
                <div className="todo-item completed">
                  <span className="todo-check">✓</span>
                  <span>로그인하기</span>
                </div>
                <div className="todo-item completed">
                  <span className="todo-check">✓</span>
                  <span>개발자 퀴즈 풀기</span>
                </div>
                <div className="todo-item">
                  <span className="todo-check">○</span>
                  <span>코딩 공부하기</span>
                </div>
                <div className="todo-item">
                  <span className="todo-check">○</span>
                  <span>프로젝트 진행하기</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>&copy; 2024 Developer Quiz Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage; 