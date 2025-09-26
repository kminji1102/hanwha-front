import React, { useState, useEffect } from 'react';
import './Timer.css';

const Timer = ({ onLogout }) => {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15분을 초로 변환
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [isQuizCorrect, setIsQuizCorrect] = useState(false);
  const [isExtended, setIsExtended] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFailureCount, setQuizFailureCount] = useState(0);

  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning && !isExtended) {
      // 15분이 지났을 때 퀴즈 표시
      setIsRunning(false);
      setShowQuiz(true);
    } else if (timeLeft === 0 && isRunning && isExtended) {
      // 5분 연장 시간까지 끝났을 때 로그아웃
      setIsRunning(false);
      setIsCompleted(true);
      // 타이머 종료 시 알림
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('타이머 종료!', {
          body: '시간이 모두 소진되었습니다. 자동으로 로그아웃됩니다.',
          icon: '/favicon.ico'
        });
      }
      
      // 3초 후 자동 로그아웃
      setTimeout(() => {
        if (onLogout) {
          onLogout();
        }
        // 페이지 새로고침으로 초기 로그인 화면으로 강제 이동
        window.location.reload();
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isExtended, onLogout]);

  const startTimer = () => {
    setIsRunning(true);
    setIsCompleted(false);
  };

  const resetTimer = () => {
    setTimeLeft(15 * 60);
    setIsRunning(false);
    setIsCompleted(false);
    setShowQuiz(false);
    setQuizAnswer('');
    setIsQuizCorrect(false);
    setIsExtended(false);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setQuizFailureCount(0);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalTime = isExtended ? 20 * 60 : 15 * 60; // 15분 또는 20분 (15분 + 5분)
    const elapsedTime = totalTime - timeLeft;
    return (elapsedTime / totalTime) * 100;
  };

  const isWarning = getProgressPercentage() >= 80;

  // 퀴즈 문제들
  const quizQuestions = [
    { question: "몇 기인가요?(형식: 00기)", answer: "18기" },
    { question: "18기 강사님의 성함은 무엇인가요?(형식: 000)", answer: "문인수" },
    { question: "등원 시간은 몇 시인가요?(형식: 00:00)", answer: "09:00" },
    { question: "출석번호 8번에 해당하는 사람의 이름은 무엇인가요?(형식: 000)", answer: "박채연" }
  ];

  const getCurrentQuestion = () => {
    return quizQuestions[currentQuizIndex];
  };

  const handleQuizSubmit = () => {
    const currentQuestion = getCurrentQuestion();
    
    if (quizAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()) {
      // 정답인 경우
      const newScore = quizScore + 1;
      setQuizScore(newScore);
      
      if (currentQuizIndex < quizQuestions.length - 1) {
        // 다음 문제로 이동
        setCurrentQuizIndex(currentQuizIndex + 1);
        setQuizAnswer('');
        alert(`정답입니다! (${newScore}/${quizQuestions.length})`);
      } else {
        // 모든 문제 완료
        setIsQuizCorrect(true);
        setShowQuiz(false);
        setTimeLeft(5 * 60); // 5분 추가
        setIsExtended(true);
        setIsRunning(true);
        setQuizAnswer('');
        setQuizFailureCount(0); // 성공 시 실패 카운트 리셋
        alert(`모든 문제를 맞췄습니다! 5분 연장 시간을 드립니다.`);
      }
    } else {
      // 틀린 경우
      const newFailureCount = quizFailureCount + 1;
      setQuizFailureCount(newFailureCount);
      
      if (newFailureCount === 1) {
        // 첫 번째 실패: 경고와 함께 재시도 기회 제공
        alert(`틀렸습니다! (${quizScore}/${quizQuestions.length} 문제 맞춤)\n\n진짜 마지막 기회입니다. 문제를 잘 읽으세요.`);
        // 틀린 시점부터 계속 진행 (현재 문제 유지)
        setQuizAnswer('');
      } else {
        // 두 번째 실패: 최종 실패
        setShowQuiz(false);
        alert(`틀렸습니다! (${quizScore}/${quizQuestions.length} 문제 맞춤) 실패하셨습니다.`);
        // 약간의 지연 후 로그아웃 실행
        setTimeout(() => {
          if (onLogout) {
            onLogout();
          }
          // 페이지 새로고침으로 초기 로그인 화면으로 강제 이동
          window.location.reload();
        }, 100);
      }
    }
  };

  return (
    <>
      {/* 퀴즈 오버레이 */}
      {showQuiz && (
        <div className="quiz-overlay">
            <div className="quiz-container">
              <h2>⏰ 시간이 끝났습니다!</h2>
              <p>한 번의 기회를 더 드리겠습니다. 아래 5문제를 모두 맞춰주세요.</p>
              <div className="quiz-progress">
                문제 {currentQuizIndex + 1} / {quizQuestions.length} (현재 점수: {quizScore}/{quizQuestions.length})
              </div>
              <div className="quiz-question">
                <h3>{getCurrentQuestion().question}</h3>
              <input
                type="text"
                value={quizAnswer}
                onChange={(e) => setQuizAnswer(e.target.value)}
                placeholder="답을 입력하세요"
                autoFocus
              />
            </div>
            <div className="quiz-buttons">
              <button className="quiz-btn submit" onClick={handleQuizSubmit}>
                제출
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`timer-container ${isCompleted ? 'completed' : ''} ${isWarning ? 'warning' : ''} ${showQuiz ? 'quiz-mode' : ''}`}>
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
          {!isRunning && !isCompleted && !showQuiz && (
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
          {isExtended && !isCompleted && '5분 연장 중...'}
        </div>
      </div>
    </>
  );
};

export default Timer; 