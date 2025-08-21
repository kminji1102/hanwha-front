import React, { useState } from 'react';
import { loginAPI } from '../api/auth';
import AYDPopup from './AYDPopup';
import './LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    nickname: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAYDPopup, setShowAYDPopup] = useState(false);
  const [currentAYDId, setCurrentAYDId] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await loginAPI(formData.nickname, formData.password);
      
      if (response.success) {
        // JWT 토큰을 로컬 스토리지에 저장
        localStorage.setItem('token', response.token);
        setMessage('로그인 성공!');
        
        // 토큰이 제대로 저장되었는지 확인 후 AYD 팝업 표시
        setTimeout(() => {
          if (localStorage.getItem('token')) {
            setShowAYDPopup(true);
            setCurrentAYDId(1);
          } else {
            setMessage('토큰 저장에 실패했습니다. 다시 시도해주세요.');
          }
        }, 100);
      } else {
        setMessage(response.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      setMessage('서버 연결에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAYD = () => {
    setShowAYDPopup(false);
    // AYD 퀴즈 완료 후 홈페이지로 이동
    if (onLoginSuccess) {
      onLoginSuccess({
        nickname: formData.nickname
      });
    }
  };

  const handleAYDIdChange = (newId) => {
    setCurrentAYDId(newId);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">SIGN IN</h2>
        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          <div className="form-group">
            <label htmlFor="nickname">ID</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="name을 입력하세요"
              autoComplete="off"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="birthday를 입력하세요"
              autoComplete="off"
            />
          </div>

          {message && (
            <div className={`message ${message.includes('성공') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>

      <AYDPopup 
        isOpen={showAYDPopup}
        onClose={handleCloseAYD}
        currentId={currentAYDId}
        onIdChange={handleAYDIdChange}
      />
    </div>
  );
};

export default LoginPage; 