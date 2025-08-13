import React, { useState, useEffect } from 'react';
import './LotteryGame.css';

const LotteryGame = ({ onSuccess, token }) => {
  const [students, setStudents] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawCount, setDrawCount] = useState(0);
  const [isBallOut, setIsBallOut] = useState(false);
  const [ballPositions, setBallPositions] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffledPositions, setShuffledPositions] = useState([]);

  // 학생 목록 가져오기
  useEffect(() => {
    if (!token) {
      setError('JWT 토큰이 필요합니다. 로그인해주세요.');
      setIsLoading(false);
      return;
    }
    
    fetchStudents();
  }, [token]);

  // 공들의 자연스러운 위치 계산 (자연스럽게 분산)
  useEffect(() => {
    if (students.length > 0) {
      calculateBallPositions();
    }
  }, [students]);

  const calculateBallPositions = () => {
    const positions = [];
    const centerX = 250; // 투명 볼의 중심 X
    const centerY = 250; // 투명 볼의 중심 Y (500px 높이의 절반)
    const maxRadius = 180; // 투명 볼 내부 반지름 (공들이 겹치지 않도록)
    
    students.forEach((student, index) => {
      // 각 공을 투명 볼 안에 균등하게 분산 배치
      const angle = (index * (360 / students.length)) + (Math.random() * 30 - 15); // 균등 분할 + 약간의 랜덤
      
      // 분산 (중앙에서 약간 떨어진 거리)
      const distance = maxRadius * (0.3 + Math.random() * 0.4);
      
      const x = centerX + Math.cos(angle * Math.PI / 180) * distance;
      const y = centerY + Math.sin(angle * Math.PI / 180) * distance;
      
      // 투명 볼 경계 내에 위치하도록 제한
      const clampedX = Math.max(40, Math.min(460, x)); // 80px 공 크기 고려
      const clampedY = Math.max(40, Math.min(460, y));
      
      positions.push({ 
        x: clampedX, 
        y: clampedY, 
        angle, 
        distance 
      });
    });
    
    setBallPositions(positions);
  };

  // 공들을 섞는 함수
  const shuffleBalls = () => {
    const positions = [];
    
    // 학생들을 랜덤하게 섞기
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    
    shuffledStudents.forEach((student, index) => {
      // 각 공이 다른 공의 원래 위치로 이동하도록 설정
      const targetIndex = (index + Math.floor(Math.random() * students.length)) % students.length;
      const targetPosition = ballPositions[targetIndex];
      
      if (targetPosition) {
        const duration = 0.5 + Math.random() * 0.5; // 0.5-1초
        const delay = index * 0.05; // 각 공마다 0.05초씩 지연
        
        positions.push({
          x: targetPosition.x,
          y: targetPosition.y,
          studentId: student.id,
          duration: duration,
          delay: delay
        });
      }
    });
    
    setShuffledPositions(positions);
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/student', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const studentData = await response.json();
        setStudents(studentData);
      } else if (response.status === 401) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
      } else if (response.status === 403) {
        setError('접근 권한이 없습니다.');
      } else {
        setError('학생 정보를 가져오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('학생 정보 가져오기 실패:', error);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 뽑기
  const drawLottery = async () => {
    if (isDrawing || students.length === 0) return;
    
    setIsDrawing(true);
    setSelectedStudent(null);
    setIsBallOut(false);
    setIsShuffling(false);
    
    // 0.5초 후에 공들이 계속 뒤섞이기 시작
    setTimeout(() => {
      setIsShuffling(true);
      
      // 공들을 계속 뒤섞이는 함수
      const continuousShuffle = () => {
        if (isShuffling) {
          shuffleBalls();
          // 0.1초마다 새로운 위치로 계속 이동 (매우 빠르게)
          setTimeout(continuousShuffle, 100);
        }
      };
      
      continuousShuffle();
      
      // 4초 후에 섞이기 완료
      setTimeout(() => {
        setIsShuffling(false);
        
        // 0.3초 후에 공이 빠져나오는 효과 시작 (0.8초에서 0.3초로 단축)
        setTimeout(() => {
          setIsBallOut(true);
          
          // 공이 빠져나오는 애니메이션이 완전히 끝난 후 (2초) 결과 표시
          setTimeout(async () => {
            try {
              const response = await fetch('/student/roulette', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.ok) {
                const result = await response.json();
                setSelectedStudent(result.student);
                setDrawCount(prev => prev + 1);
                
                // 성공 시 콜백 호출
                onSuccess(`뽑기 게임 완료! 당첨자: ${result.student.name}`);
              } else if (response.status === 401) {
                setError('인증이 만료되었습니다. 다시 로그인해주세요.');
              } else if (response.status === 403) {
                setError('접근 권한이 없습니다.');
              } else {
                setError('뽑기에 실패했습니다.');
              }
            } catch (error) {
              console.error('뽑기 실패:', error);
              setError('네트워크 오류가 발생했습니다.');
            } finally {
              setIsDrawing(false);
            }
          },500); // 공이 빠져나오는 애니메이션 완료 후 바로 결과 표시 (2.5초에서 2초로 단축)
        }, 100); // 0.1초 후 공 빠져나오기 시작
      }, 4000); // 4초 후 섞이기 완료
    }, 500); // 0.5초 후 섞이기 시작
  };

  // 로또 재시작
  const resetLottery = () => {
    setSelectedStudent(null);
    setDrawCount(0);
    setIsBallOut(false);
    setIsShuffling(false);
    setShuffledPositions([]);
  };

  if (isLoading) {
    return <div className="lottery-loading">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="lottery-error">
        <h3>오류 발생</h3>
        <p>{error}</p>
        <button onClick={fetchStudents} className="retry-btn">다시 시도</button>
      </div>
    );
  }

  return (
    <div className="lottery-game">
      <div className="game-header">
        <h2>Lottery Game - 2단계</h2>
        <p>투명 볼 안의 공들이 섞인 후 하나가 빠져나옵니다!</p>
      </div>
      
      <div className="game-container">
        <div className="lottery-section">
          <div className="lottery-machine">
            {/* 투명 볼 */}
            <div className="transparent-ball">
              {/* 로또 공들 */}
              {students.map((student, index) => {
                // 현재 위치 결정: 섞이는 중이면 shuffledPositions에서 찾고, 아니면 원래 위치
                const currentPosition = isShuffling && shuffledPositions.length > 0 
                  ? shuffledPositions.find(p => p.studentId === student.id) 
                  : ballPositions[index];
                
                // ballPositions가 아직 설정되지 않았으면 렌더링하지 않음
                if (!ballPositions[index]) return null;
                
                return (
                  <div
                    key={student.id}
                    className={`lottery-ball ${selectedStudent?.id === student.id ? 'selected' : ''} ${isShuffling ? 'shuffling' : ''} ${isBallOut && selectedStudent?.id === student.id ? 'ball-out' : ''}`}
                    style={{
                      '--ball-color': `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
                      '--shuffle-duration': `${currentPosition?.duration || 1}s`,
                      '--shuffle-delay': `${currentPosition?.delay || 0}s`,
                      '--initial-x': `${ballPositions[index]?.x || 0}px`,
                      '--initial-y': `${ballPositions[index]?.y || 0}px`,
                      '--final-x': `${currentPosition?.x || ballPositions[index]?.x || 0}px`,
                      '--final-y': `${currentPosition?.y || ballPositions[index]?.y || 0}px`,
                      left: `${currentPosition?.x || ballPositions[index]?.x || 0}px`,
                      top: `${currentPosition?.y || ballPositions[index]?.y || 0}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <span className="student-name">
                      {student.name}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* 빠져나온 공이 표시될 영역 */}
            {isBallOut && selectedStudent && (
              <div className="ball-exit-area">
                <div className="exited-ball">
                  <div 
                    className="lottery-ball selected"
                    style={{
                      '--ball-color': `hsl(${(students.findIndex(s => s.id === selectedStudent.id) * 137.5) % 360}, 70%, 60%)`
                    }}
                  >
                    <span className="student-name">
                      {selectedStudent.name}
                    </span>
                  </div>
                  <div className="winner-text">🎉 당첨자! 🎉</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="lottery-controls">
            <button
              onClick={drawLottery}
              disabled={isDrawing || students.length === 0}
              className={`draw-btn ${isDrawing ? 'drawing' : ''}`}
            >
              {isDrawing ? '뽑는 중...' : '뽑기'}
            </button>
            
            {selectedStudent && (
              <button onClick={resetLottery} className="reset-btn">
                다시 시작
              </button>
            )}
          </div>
        </div>
        
        <div className="game-info">
          <div className="game-status">
            <p>참가자: {students.length}명</p>
            {selectedStudent && (
              <p>당첨자: {selectedStudent.name}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotteryGame;
