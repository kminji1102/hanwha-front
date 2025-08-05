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
    question: "다음 중 올바른 이미지를 고르세요.",
    type: "image", // 이미지 선택 타입
    options: ["이미지1", "이미지2"],
    correctAnswer: 0,
    images: [이미지1, 이미지2]
  },
  {
    id: 2,
    question: "다음 이미지의 네모칸에 들어갈 말로 올바른 것은?",
    type: "text", // 텍스트 선택 타입
    options: ["1번 역시 나야", "2번 나이스", "3번 왜?", "4번 잘됐다!"],
    correctAnswer: 2,
    images: [이미지4, 이미지3]
  },
  {
    id: 3,
    question: "다음 상황에서 남편이 사온 것은?",
    type: "text", // 텍스트 선택 타입
    options: ["1번 우유 1개", "2번 우유 6개", "3번 아보카도 1개", "4번 아보카도 6개"],
    correctAnswer: 1,
    images: [이미지6, 이미지5]
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
  const [showRedOverlay, setShowRedOverlay] = useState(false);

  useEffect(() => {
    if (isOpen && currentId) {
      setLocalId(currentId);
      loadAYDData(currentId);
      setCurrentQuiz(0);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowResult(false);
      setShowSecondImage(false);
      setShowRedOverlay(false);
    }
  }, [isOpen, currentId]);

  const loadAYDData = async (id) => {
    setLoading(true);
    setError('');
    try {
      const data = await getAYDById(id);

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
    
    if (correct) {
      setShowResult(true);
      setShowSecondImage(true);
      // 1초 후 자동으로 다음 문제로 넘어가기
      setTimeout(() => {
        handleNextQuestion();
      }, 1000);
    } else {
      setShake(true);
      setShowRedOverlay(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setShowRedOverlay(false), 500);
      // 틀렸을 때는 결과를 보여주지 않고 다시 선택할 수 있게 함
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuiz < quizData.length - 1) {
      setCurrentQuiz(currentQuiz + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowResult(false);
      setShowSecondImage(false);
      setShowRedOverlay(false);
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

              {quizData[currentQuiz].type === "image" ? (
                // 이미지 선택 방식
                <div className="quiz-images">
                  {quizData[currentQuiz].images.map((image, index) => (
                    <div 
                      key={index} 
                      className={`quiz-image-wrapper ${selectedAnswer === index ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <img 
                        src={image}
                        alt={`Quiz Image ${index + 1}`}
                        className="quiz-image"
                        onError={(e) => {
                          console.error('퀴즈 이미지 로드 실패:', e.target.src);
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                // 텍스트 선택 방식
                <>
                  <div className="quiz-images">
                    {!showSecondImage ? (
                      // 정답 전: 첫 번째 이미지만 표시
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
                    ) : (
                      // 정답 후: 정답 이미지만 표시
                      <div className="quiz-image-wrapper">
                        <img 
                          src={quizData[currentQuiz].images[1]}
                          alt={`Correct Answer Image`}
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
                </>
              )}

              {showResult && (
                <div className="quiz-result">
                  <div className="result-correct">
                    <span>정답입니다! 🎉</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 틀렸을 때 투명한 빨간 화면 오버레이 */}
      {showRedOverlay && (
        <div className="red-overlay"></div>
      )}
    </div>
  );
};

export default AYDPopup; 