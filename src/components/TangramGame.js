import React, { useRef, useEffect, useState } from 'react';
import './TangramGame.css';

const TangramGame = ({ onSuccess, token }) => {
  const canvasRef = useRef(null);
  const [vueCode, setVueCode] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [starState, setStarState] = useState({
    x: 50,
    y: 50,
    rotation: 0,
    scale: 1,
    color: '#FFD700' // 노란색
  });

  // 목표 상태 (힌트용)
  const targetState = {
    x: 300,
    y: 200,
    rotation: Math.PI, // 180도
    scale: 1.5,
    color: '#FF0000' // 빨간색
  };

  // 별 그리기 함수
  const drawStar = (ctx, x, y, radius, spikes, rotation, scale, color) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    
    ctx.beginPath();
    ctx.fillStyle = color;
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const r = i % 2 === 0 ? radius : radius * 0.5;
      const xPos = Math.cos(angle) * r;
      const yPos = Math.sin(angle) * r;
      
      if (i === 0) {
        ctx.moveTo(xPos, yPos);
      } else {
        ctx.lineTo(xPos, yPos);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // 캔버스 초기화 및 별 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 캔버스 크기 설정
    canvas.width = 600;
    canvas.height = 400;
    
    // 배경 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 현재 별 그리기
    drawStar(ctx, starState.x, starState.y, 30, 5, starState.rotation, starState.scale, starState.color);
    
    // 힌트가 활성화된 경우 목표 상태를 반투명하게 표시
    if (showHint) {
      ctx.globalAlpha = 0.3;
      drawStar(ctx, targetState.x, targetState.y, 30, 5, targetState.rotation, targetState.scale, targetState.color);
      ctx.globalAlpha = 1.0;
      
      // 목표 위치에 점선 원 그리기
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(targetState.x, targetState.y, 35, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // 목표 텍스트 표시
      ctx.fillStyle = '#FF0000';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('목표 위치', targetState.x, targetState.y - 50);
    }
  }, [starState, showHint]);

  // Vue 코드 파싱 및 실행 함수
  const parseAndExecuteCode = (code) => {
    const newState = { ...starState };
    const commands = code.toLowerCase().split('\n');
    
    commands.forEach(command => {
      const trimmedCommand = command.trim();
      if (!trimmedCommand || trimmedCommand.startsWith('//')) return;
      
      // 회전 명령어 파싱
      if (trimmedCommand.includes('rotate')) {
        const match = trimmedCommand.match(/rotate\s+(\d+)/);
        if (match) {
          const degrees = parseInt(match[1]);
          newState.rotation = (degrees * Math.PI) / 180;
        }
      }
      
      // 색상 변경 명령어 파싱
      if (trimmedCommand.includes('color')) {
        if (trimmedCommand.includes('red')) {
          newState.color = '#FF0000';
        } else if (trimmedCommand.includes('blue')) {
          newState.color = '#0000FF';
        } else if (trimmedCommand.includes('green')) {
          newState.color = '#00FF00';
        } else if (trimmedCommand.includes('yellow')) {
          newState.color = '#FFFF00';
        } else if (trimmedCommand.includes('purple')) {
          newState.color = '#800080';
        } else if (trimmedCommand.includes('orange')) {
          newState.color = '#FFA500';
        } else if (trimmedCommand.includes('pink')) {
          newState.color = '#FFC0CB';
        } else if (trimmedCommand.includes('black')) {
          newState.color = '#000000';
        } else if (trimmedCommand.includes('white')) {
          newState.color = '#FFFFFF';
        }
      }
      
      // 크기 조절 명령어 파싱
      if (trimmedCommand.includes('scale')) {
        const match = trimmedCommand.match(/scale\s+([\d.]+)/);
        if (match) {
          newState.scale = parseFloat(match[1]);
        }
      }
      
      // 위치 이동 명령어 파싱
      if (trimmedCommand.includes('move') || trimmedCommand.includes('position')) {
        const xMatch = trimmedCommand.match(/x\s*=\s*(\d+)/);
        const yMatch = trimmedCommand.match(/y\s*=\s*(\d+)/);
        if (xMatch) newState.x = parseInt(xMatch[1]);
        if (yMatch) newState.y = parseInt(yMatch[1]);
      }
      
      // 중앙 이동 명령어
      if (trimmedCommand.includes('center') || trimmedCommand.includes('중앙')) {
        newState.x = 300;
        newState.y = 200;
      }
      
      // 위로 이동
      if (trimmedCommand.includes('up')) {
        newState.y = Math.max(30, newState.y - 50);
      }
      
      // 아래로 이동
      if (trimmedCommand.includes('down')) {
        newState.y = Math.min(370, newState.y + 50);
      }
      
      // 왼쪽으로 이동
      if (trimmedCommand.includes('left')) {
        newState.x = Math.max(30, newState.x - 50);
      }
      
      // 오른쪽으로 이동
      if (trimmedCommand.includes('right')) {
        newState.x = Math.min(570, newState.x + 50);
      }
      
      // 리셋 명령어
      if (trimmedCommand.includes('reset')) {
        newState.x = 50;
        newState.y = 50;
        newState.rotation = 0;
        newState.scale = 1;
        newState.color = '#FFD700';
      }
    });
    
    return newState;
  };

  // Vue 코드 실행 함수
  const executeVueCode = async () => {
    if (!vueCode.trim()) return;
    
    setIsExecuting(true);
    
    try {
      // 코드 실행하여 별 상태 변경
      const newState = parseAndExecuteCode(vueCode);
      setStarState(newState);
      
      // 성공 조건 확인
      if (newState.rotation === Math.PI && 
          newState.color === '#FF0000' && 
          newState.scale === 1.5 && 
          newState.x === 300 && 
          newState.y === 200) {
        // 성공 메시지 표시
        alert('🎉 1단계 성공! \n2단계를 진행할 수 있습니다.');
        // API 호출은 HomePage에서 처리하도록 onSuccess만 호출
        onSuccess(vueCode);
      } else {
        // 실패 시 메시지 표시
        alert('목표를 달성하지 못했습니다. 코드를 다시 확인해주세요.');
      }
      
    } catch (error) {
      console.error('코드 실행 오류:', error);
      alert('코드 실행 중 오류가 발생했습니다.');
    } finally {
      setIsExecuting(false);
    }
  };

  // 실시간 코드 실행 (입력 시마다)
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setVueCode(newCode);
    
    // 코드가 있을 때만 실시간 실행
    if (newCode.trim()) {
      const newState = parseAndExecuteCode(newCode);
      setStarState(newState);
    }
  };

  // 힌트 토글 함수
  const toggleHint = () => {
    setShowHint(!showHint);
  };

  return (
    <div className="tangram-game">
      <div className="game-header">
        <h2>Tangram Game - 1단계</h2>
        <p>별 모양 도형을 조작하여 목표를 달성하세요!</p>
      </div>
      
      <div className="game-container">
        <div className="canvas-section">
          <h3>캔버스</h3>
          <canvas 
            ref={canvasRef} 
            className="game-canvas"
            width="600" 
            height="400"
          />
          <div className="canvas-info">
            <p>별의 현재 상태:</p>
            <ul>
              <li>position: ({starState.x}, {starState.y})</li>
              <li>rotate: {Math.round(starState.rotation * 180 / Math.PI)}도</li>
              <li>scale: {starState.scale}x</li>
              <li>color: {starState.color}</li>
            </ul>
            {/* {showHint && (
              <div className="hint-info">
                <p>사용 가능한 명령어:</p>
                <ul>
                  <li><code>rotate [각도]</code> - 별을 회전 </li>
                  <li><code>color [색상]</code> - 색상 변경 </li>
                  <li><code>scale [배율]</code> - 크기 조절 </li>
                  <li><code>center</code> - 중앙으로 이동</li>
                  <li><code>up/down/left/right</code> - 방향 이동</li>
                  <li><code>reset</code> - 초기 상태로 리셋</li>
                </ul>
              </div>
            )} */}
          </div>
        </div>
        
        <div className="code-section">
          <h3>Vue 코드 입력</h3>
          <div className="code-input-container">
            <textarea
              value={vueCode}
              onChange={handleCodeChange}
              placeholder="Vue.js 코드를 입력하세요."
              className="code-textarea"
              rows="15"
            />
            <div className="code-buttons">
              <button 
                onClick={toggleHint}
                className={`hint-btn ${showHint ? 'active' : ''}`}
                disabled={isExecuting}
              >
                {showHint ? '목표 위치 숨기기' : '목표 위치 보기'}
              </button>
              <button 
                onClick={executeVueCode}
                className="execute-btn"
                disabled={!vueCode.trim() || isExecuting}
              >
                {isExecuting ? '실행 중...' : '입력'}
              </button>
            </div>
          </div>
          
          <div className="code-instructions">
            <h4>목표:</h4>
            <ul>
              <li>별을 180도 회전시키기</li>
              <li>색깔을 노란색에서 빨간색으로 바꾸기</li>
              <li>별의 크기를 1.5배 키우기</li>
              <li>별을 캔버스 정중앙으로 이동시키기</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TangramGame;
