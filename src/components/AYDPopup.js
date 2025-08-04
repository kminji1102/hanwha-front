import React, { useState, useEffect } from 'react';
import { getAYDById } from '../api/auth';
import './AYDPopup.css';

const AYDPopup = ({ isOpen, onClose, currentId = 1, onIdChange }) => {
  const [aydData, setAydData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [localId, setLocalId] = useState(currentId);
  const [maxId, setMaxId] = useState(3);

  useEffect(() => {
    if (isOpen && currentId) {
      setLocalId(currentId);
      loadAYDData(currentId);
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

  if (!isOpen) return null;

  return (
    <div className="ayd-overlay">
      <div className="ayd-popup">
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
          ) : aydData ? (
            <div className="ayd-image-container">
              {aydData.imageFileUrl && (
                <img 
                  src={aydData.imageFileUrl} 
                  alt="AYD Image" 
                  className="ayd-image"
                  onError={(e) => {
                    console.error('이미지 로드 실패:', e.target.src);
                    setError('이미지 파일을 찾을 수 없습니다.');
                  }}
                  onLoad={() => {
                    console.log('이미지 로드 성공:', aydData.imageFileUrl);
                  }}
                />
              )}
              <div className="ayd-info">
                <p className="ayd-filename">파일명: {aydData.imageFileName}</p>
              </div>
            </div>
          ) : null}
        </div>

          
          <div className="ayd-counter">
            {localId} / {maxId}
          </div>

        
      </div>
    </div>
  );
};

export default AYDPopup; 