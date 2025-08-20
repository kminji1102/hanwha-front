import React, { useState } from 'react';
import './HomePage.css';
import TangramGame from './TangramGame';
import LotteryGame from './LotteryGame';
import { submitVueCode } from '../api/vueCode';
import companyLogo from '../image/한화시스템&엔코아_투명.png';

const HomePage = ({ userInfo, onLogout, token }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Completed, setStep1Completed] = useState(false);
  const [step2Completed, setStep2Completed] = useState(false);
  const [lastVueCode, setLastVueCode] = useState('');
  const [latestWinner, setLatestWinner] = useState(null);
  const [showAsciiTable, setShowAsciiTable] = useState(false);

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

  // 최신 당첨자 정보 가져오기
  const fetchLatestWinner = async () => {
    try {
      const response = await fetch('/student/latest', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const winnerName = await response.text();
        if (winnerName !== "아직 선택된 학생이 없습니다.") {
          setLatestWinner(winnerName);
        }
      } else {
        console.error('최신 당첨자 정보 가져오기 실패');
      }
    } catch (error) {
      console.error('최신 당첨자 정보 가져오기 실패:', error);
    }
  };

  const handleStepChange = async (step) => {
    if (step === 1) {
      setCurrentStep(1);
    } else if (step === 2 && step1Completed) {
      setCurrentStep(2);
    } else if (step === 3 && step1Completed && step2Completed) {
      // 3단계로 이동할 때 백엔드 API를 통해 당첨자 이름 가져오기
      await fetchLatestWinner();
      setCurrentStep(3);
    }
  };

  const toggleAsciiTable = () => {
    setShowAsciiTable(!showAsciiTable);
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
              <div className="escape-success">
                <div className="success-message">
                  <h3>🎉🎉</h3>
                  {latestWinner ? (
                    <p className="winner-escape-text">
                      <strong>{latestWinner}</strong>님이 <span className="c5-location">C-5 자리</span>에 가서 <strong>"83.78.65.67.75 사주세요"</strong>라고 말하면 성공입니다.
                    </p>
                  ) : (
                    <p className="winner-escape-text">
                      당첨자가 <span className="c5-location">C-5 자리</span>에 가서 <strong>"83.78.65.67.75 사주세요"</strong>라고 말하면 성공입니다.
                    </p>
                  )}
                  
                  {/* 경고문 추가 */}
                  <div className="warning-message">
                    <p>⚠️ 자리를 잘 찾으세요. 기회는 단 한 번입니다.</p>
                  </div>
                </div>
              </div>
              
              {/* 아스키코드표 버튼 */}
              <div className="ascii-table-section">
                <button 
                  className="ascii-table-btn"
                  onClick={toggleAsciiTable}
                >
                  📋 힌트 보기
                </button>
              </div>
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
          <div className="header-left">
            <img 
              src={companyLogo}
              alt="한화시스템&엔코아 로고" 
              className="company-logo"
            />
            <h1 className="welcome-title"></h1>
          </div>
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
        
        {/* 아스키코드표 모달 */}
        {showAsciiTable && (
          <div className="ascii-modal-overlay" onClick={toggleAsciiTable}>
            <div className="ascii-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ascii-modal-header">
                {/* <h3>📋 ASCII 코드표</h3> */}
                <button className="ascii-modal-close" onClick={toggleAsciiTable}>
                  ✕
                </button>
              </div>
              <div className="ascii-modal-content">
                {/* 힌트 섹션을 테이블 위로 이동 */}
                <div className="ascii-hint">
                  <p><strong>💡 힌트:</strong> "83.78.65.67.75"는 ASCII 코드입니다!</p>
                </div>
                
                {/* <div className="ascii-table">
                  <div className="ascii-table-header">
                    <span>Dec</span>
                    <span>Hex</span>
                    <span>Char</span>
                    <span>Description</span>
                  </div>
                  {[
                    { dec: 65, hex: '41', char: 'A', desc: '대문자 A' },
                    { dec: 66, hex: '42', char: 'B', desc: '대문자 B' },
                    { dec: 67, hex: '43', char: 'C', desc: '대문자 C' },
                    { dec: 68, hex: '44', char: 'D', desc: '대문자 D' },
                    { dec: 69, hex: '45', char: 'E', desc: '대문자 E' },
                    { dec: 70, hex: '46', char: 'F', desc: '대문자 F' },
                    { dec: 71, hex: '47', char: 'G', desc: '대문자 G' },
                    { dec: 72, hex: '48', char: 'H', desc: '대문자 H' },
                    { dec: 73, hex: '49', char: 'I', desc: '대문자 I' },
                    { dec: 74, hex: '4A', char: 'J', desc: '대문자 J' },
                    { dec: 75, hex: '4B', char: 'K', desc: '대문자 K' },
                    { dec: 76, hex: '4C', char: 'L', desc: '대문자 L' },
                    { dec: 77, hex: '4D', char: 'M', desc: '대문자 M' },
                    { dec: 78, hex: '4E', char: 'N', desc: '대문자 N' },
                    { dec: 79, hex: '4F', char: 'O', desc: '대문자 O' },
                    { dec: 80, hex: '50', char: 'P', desc: '대문자 P' },
                    { dec: 81, hex: '51', char: 'Q', desc: '대문자 Q' },
                    { dec: 82, hex: '52', char: 'R', desc: '대문자 R' },
                    { dec: 83, hex: '53', char: 'S', desc: '대문자 S' },
                    { dec: 84, hex: '54', char: 'T', desc: '대문자 T' },
                    { dec: 85, hex: '55', char: 'U', desc: '대문자 U' },
                    { dec: 86, hex: '56', char: 'V', desc: '대문자 V' },
                    { dec: 87, hex: '57', char: 'W', desc: '대문자 W' },
                    { dec: 88, hex: '58', char: 'X', desc: '대문자 X' },
                    { dec: 89, hex: '59', char: 'Y', desc: '대문자 Y' },
                    { dec: 90, hex: '5A', char: 'Z', desc: '대문자 Z' }
                  ].map((item, index) => (
                    <div key={index} className="ascii-table-row">
                      <span className="ascii-dec">{item.dec}</span>
                      <span className="ascii-hex">{item.hex}</span>
                      <span className="ascii-char">{item.char}</span>
                      <span className="ascii-desc">{item.desc}</span>
                    </div>
                  ))}
                </div> */}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="home-footer">
        <p>&copy; Let's go below zero and hide from the sun.</p>
      </footer>
    </div>
  );
};

export default HomePage; 