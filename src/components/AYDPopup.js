import React, { useState, useEffect } from 'react';
import { getAYDById } from '../api/auth';
import './AYDPopup.css';

// 이미지 import
import 이미지1 from '../image/사실_원본.png';
import 이미지2 from '../image/사실_편집본.png';
import 이미지3 from '../image/왜_원본.png';
import 이미지4 from '../image/왜_편집본.jpg';
import 이미지5 from '../image/아보카도_원본.jpg';
import 이미지6 from '../image/아보카도_편집본.png';

const quizData = [
  {
    id: 1,
    question: "다음 중 올바른 것을을 고르세요.",
    options: ["'이미지1'", "'이미지2'"],
    correctAnswer: 0,
    images: [이미지1, 이미지2]
  },
  {
    id: 2,
    question: "다음 이미지의 네모칸에 들어갈 말로 올바른 것은?",
    options: ["1번 역시 나야", "2번 나이스", "3번 왜?", "4번 잘됐다!"],
    correctAnswer: 2,
    images: [이미지3, 이미지4]
  },
  {
    id: 3,
    question: "다음 상황에서 남편이 사온 것은?",
    options: ["1번 우유 1개", "2번 우유 6개", "3번 아보카도 1개", "4번 아보카도 6개"],
    correctAnswer: 1,
    images: [이미지5, 이미지6]
  }
];

const AYDPopup = ({ isOpen, onClose, currentId = 1, onIdChange }) => {
  const [aydData, setAydData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [localId, setLocalId] = useState(currentId);
  const [maxId, setMaxId] = useState(3);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [shake, setShake] = useState(false);
  const [showSecondImage, setShowSecondImage] = useState(false);

  useEffect(() => {
    if (isOpen && currentId) {
      setLocalId(currentId);
      loadAYDData(currentId);
      setCurrentQuiz(0);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowResult(false);
      setShowSecondImage(false);
    }
  }, [isOpen, currentId]);

  const loadAYDData = async (id) => {
    setLoading(true);
    setError('');
    try {
      const data = await getAYDById(id);
      console.log('AYD 데이터:', data);
      
      // 이미지 URL을 디코딩하여 사용
      if (data.imageFileUrl) {
        data.imageFileUrl = decodeURIComponent(data.imageFileUrl);
      }
      
      setAydData(data);
    } catch (err) {
      console.error('AYD 데이터 로드 실패:', err);
      if (err.message.includes('404') || err.message.includes('존재하지 않습니다')) {
        setError(`ID ${id}의 이미지가 존재하지 않습니다.`);
        setMaxId(id - 1);
      } else {
        setError('이미지를 불러올 수 없습니다. 서버를 확인해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === quizData[currentQuiz].correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (!correct) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } else {
      // 정답일 때 두 번째 이미지 표시
      setShowSecondImage(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuiz < quizData.length - 1) {
      setCurrentQuiz(currentQuiz + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowResult(false);
      setShowSecondImage(false);
    } else {
      // 모든 퀴즈 완료
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ayd-overlay">
      <div className={`ayd-popup ${shake ? 'shake' : ''}`}>
        <div className="ayd-header">
          <h2 className="ayd-title">Are You Developer?</h2>
        </div>
        
        <div className="ayd-content">
          {loading ? (
            <div className="ayd-loading">
              <div className="loading-spinner"></div>
              <p>로딩 중...</p>
            </div>
          ) : error ? (
            <div className="ayd-error">
              <p>{error}</p>
              <button 
                className="nav-btn retry-btn" 
                onClick={() => loadAYDData(localId)}
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div className="quiz-container">
              <div className="quiz-progress">
                문제 {currentQuiz + 1} / {quizData.length}
              </div>
              
              <div className="quiz-question">
                <h3>{quizData[currentQuiz].question}</h3>
              </div>

              <div className="quiz-images">
                <div className="quiz-image-wrapper">
                  <img 
                    src={quizData[currentQuiz].images[0]}
                    alt={`Quiz Image 1`}
                    className="quiz-image"
                    onError={(e) => {
                      console.error('퀴즈 이미지 로드 실패:', e.target.src);
                    }}
                  />
                </div>
                {showSecondImage && (
                  <div className="quiz-image-wrapper">
                    <img 
                      src={quizData[currentQuiz].images[1]}
                      alt={`Quiz Image 2`}
                      className="quiz-image"
                      onError={(e) => {
                        console.error('퀴즈 이미지 로드 실패:', e.target.src);
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="quiz-options">
                {quizData[currentQuiz].options.map((option, index) => (
                  <button
                    key={index}
                    className={`quiz-option ${
                      selectedAnswer === index 
                        ? isCorrect 
                          ? 'correct' 
                          : 'incorrect'
                        : ''
                    } ${showResult && index === quizData[currentQuiz].correctAnswer ? 'correct-answer' : ''}`}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {showResult && (
                <div className="quiz-result">
                  {isCorrect ? (
                    <div className="result-correct">
                      <span>정답입니다! 🎉</span>
                      <button 
                        className="nav-btn next-btn" 
                        onClick={handleNextQuestion}
                      >
                        {currentQuiz < quizData.length - 1 ? '다음 문제' : '완료'}
                      </button>
                    </div>
                  ) : (
                    <div className="result-incorrect">
                      <span>틀렸습니다! 😅</span>
                      <p>정답: {quizData[currentQuiz].options[quizData[currentQuiz].correctAnswer]}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ayd-counter">
          {localId} / {maxId}
        </div>
      </div>
    </div>
  );
};

export default AYDPopup; 