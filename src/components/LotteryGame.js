import React, { useState, useEffect } from 'react';
import './LotteryGame.css';

const LotteryGame = ({ onSuccess, token }) => {
  const [students, setStudents] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawCount, setDrawCount] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  // 학생 목록 가져오기
  useEffect(() => {
    if (!token) {
      setError('JWT 토큰이 필요합니다. 로그인해주세요.');
      setIsLoading(false);
      return;
    }
    
    fetchStudents();
  }, [token]);

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
    setIsShuffling(true);
    
    // 3초 동안 공들이 섞이기
    setTimeout(async () => {
      setIsShuffling(false);
      
      // 0.5초 후에 결과 표시
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
            
            // 2단계 성공 시 alert 표시
            alert(`🎉 당첨자: ${result.student.name} \n3단계를 진행할 수 있습니다.`);
            
            // 성공 시 콜백 호출
            onSuccess(`뽑기 게임 완료! 당첨자: ${result.student.name}`);
            setHasDrawn(true); // 뽑기 완료 후 상태 업데이트
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
      }, 500);
    }, 3000);
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

  // 각 공의 기본 위치를 CSS 변수로 설정
  const getBallPosition = (index) => {
    const totalStudents = students.length;
    
    // 학생 수가 10명 이하면 기존 위치 사용
    if (totalStudents <= 10) {
      const positions = [
        { left: '30%', top: '30%' },
        { left: '70%', top: '30%' },
        { left: '70%', top: '70%' },
        { left: '30%', top: '70%' },
        { left: '50%', top: '20%' },
        { left: '80%', top: '50%' },
        { left: '50%', top: '80%' },
        { left: '20%', top: '50%' },
        { left: '40%', top: '45%' },
        { left: '60%', top: '45%' }
      ];
      
      return positions[index] || { left: '50%', top: '50%' };
    }
    
    // 학생 수가 10명을 넘으면 동적으로 위치 계산
    // 완벽한 원형이 아닌 약간의 랜덤성을 추가하여 자연스럽게
    const baseAngle = (index / totalStudents) * 2 * Math.PI;
    const randomOffset = (Math.random() - 0.5) * 0.4; // ±20% 랜덤 오프셋
    const angle = baseAngle + randomOffset;
    
    // 여러 레이어로 분산 (중앙, 중간, 바깥쪽)
    const layer = index % 5; // 0: 중앙, 1: 중간, 2: 바깥쪽, 3: 가장 바깥쪽, 4: 랜덤
    const baseRadius = [25, 40, 55, 70, 45][layer]; // 각 레이어별 기본 반지름
    
    // 각 공마다 약간의 랜덤한 반지름 변화
    const radiusVariation = (Math.random() - 0.5) * 20; // ±10% 변화
    const radius = Math.max(20, Math.min(70, baseRadius + radiusVariation));
    
    // 위치 계산
    const left = 50 + radius * Math.cos(angle);
    const top = 50 + radius * Math.sin(angle);
    
    // 투명 볼 경계 내에 안전하게 배치
    return {
      left: `${Math.max(15, Math.min(85, left))}%`,
      top: `${Math.max(15, Math.min(85, top))}%`
    };
  };

  // 각 공의 애니메이션 패턴을 동적으로 할당
  const getAnimationPattern = (index) => {
    const patterns = [
      'shuffleCircle1',
      'shuffleZigzag1', 
      'shuffleFigure8',
      'shuffleRandom1',
      'shuffleSpiral1',
      'shuffleSquare1',
      'shuffleTriangle1',
      'shuffleRandom2',
      'shuffleCircle2',
      'shuffleZigzag2'
    ];
    
    // 패턴이 10개를 넘어가면 랜덤하게 선택
    if (index < patterns.length) {
      return patterns[index];
    } else {
      return patterns[Math.floor(Math.random() * patterns.length)];
    }
  };

  return (
    <div className="lottery-game">
      <div className="game-header">
        <h2>2단계</h2>
        <p>투명 볼 안의 공들이 섞인 후 하나가 빠져나옵니다!</p>
      </div>
      
      <div className="game-container">
        <div className="lottery-section">
          <div className="lottery-machine">
            {/* 투명 볼 */}
            <div className="transparent-ball">
              {/* 로또 공들 */}
              {students.map((student, index) => {
                const position = getBallPosition(index);
                // 각 공마다 랜덤한 지연시간과 지속시간 설정
                const randomDelay = (Math.random() * 0.5).toFixed(2);
                const randomDuration = (1.2 + Math.random() * 1.0).toFixed(1);
                const animationPattern = getAnimationPattern(index);
                
                return (
                  <div
                    key={student.id}
                    className={`lottery-ball ${selectedStudent?.id === student.id ? 'selected' : ''} ${isShuffling ? 'shuffling' : ''}`}
                    style={{
                      '--ball-color': `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
                      '--shuffle-delay': `${randomDelay}s`,
                      '--shuffle-duration': `${randomDuration}s`,
                      '--shuffle-animation': animationPattern,
                      '--ball-index': index,
                      '--initial-left': position.left,
                      '--initial-top': position.top,
                      // 인라인 스타일로 위치 직접 적용
                      left: position.left,
                      top: position.top
                    }}
                  >
                    <span className="student-name">
                      {student.name}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* 당첨자 결과 표시 영역 */}
            {selectedStudent && (
              <div className="winner-result-area">
                <div className="winner-display">
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
              disabled={isDrawing || students.length === 0 || hasDrawn}
              className={`draw-btn ${isDrawing ? 'drawing' : ''} ${hasDrawn ? 'drawn' : ''}`}
            >
              {isDrawing ? '뽑는 중...' : hasDrawn ? '뽑기 완료' : '뽑기'}
            </button>
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
