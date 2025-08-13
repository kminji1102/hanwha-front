import React, { useState } from 'react';
import './HomePage.css';
import TangramGame from './TangramGame';
import LotteryGame from './LotteryGame';
import { submitVueCode } from '../api/vueCode';

const HomePage = ({ userInfo, onLogout, token }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Completed, setStep1Completed] = useState(false);
  const [step2Completed, setStep2Completed] = useState(false);
  const [lastVueCode, setLastVueCode] = useState('');

  const handleGameSuccess = async (vueCode) => {
    try {
      // 성공 시 API 호출
      if (token) {
        await submitVueCode(vueCode, token);
      }
      setStep1Completed(true);
      setLastVueCode(vueCode);
      // 성공 메시지만 표시하고 자동으로 단계를 넘기지 않음
    } catch (error) {
      console.error('코드 제출 오류:', error);
      // API 호출 실패해도 게임은 성공으로 처리
      setStep1Completed(true);
      setLastVueCode(vueCode);
    }
  };

  const handleStep2Success = () => {
    setStep2Completed(true);
    // 2단계 성공 시에도 자동으로 단계를 넘기지 않음
  };

  const handleStepChange = (step) => {
    if (step === 1) {
      setCurrentStep(1);
    } else if (step === 2 && step1Completed) {
      setCurrentStep(2);
    } else if (step === 3 && step1Completed && step2Completed) {
      setCurrentStep(3);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content step-1-content">
            <TangramGame onSuccess={handleGameSuccess} token={token} />
          </div>
        );
      case 2:
        return (
          <div className="step-content step-2-content">
            <LotteryGame onSuccess={handleStep2Success} token={token} />
          </div>
        );
      case 3:
        return (
          <div className="step-content step-3-content">
            <div className="step-card">
              <h2>3단계 - 최종 단계</h2>
              <p>모든 단계를 성공적으로 완료했습니다! 🏆</p>
              <p>축하합니다!</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
        <div className="step-navigation">
          <button 
            className={`step-btn ${currentStep === 1 ? 'active' : ''} ${step1Completed ? 'completed' : ''}`}
            onClick={() => handleStepChange(1)}
          >
            1단계 {step1Completed && '✓'}
          </button>
          <button 
            className={`step-btn ${currentStep === 2 ? 'active' : ''} ${step1Completed ? 'completed' : ''}`}
            onClick={() => handleStepChange(2)}
            disabled={!step1Completed}
          >
            2단계 {step2Completed && '✓'}
          </button>
          <button 
            className={`step-btn ${currentStep === 3 ? 'active' : ''} ${step1Completed && step2Completed ? 'completed' : ''}`}
            onClick={() => handleStepChange(3)}
            disabled={!(step1Completed && step2Completed)}
          >
            3단계
          </button>
        </div>

        {renderStepContent()}
      </main>

      <footer className="home-footer">
        <p>&copy; Let's go below zero and hide from the sun.</p>
      </footer>
    </div>
  );
};

export default HomePage; 