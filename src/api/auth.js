const API_BASE_URL = '';

export const loginAPI = async (nickname, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/member/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nickname: nickname,
        password: password
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('로그인 요청 중 오류 발생:', error);
    throw error;
  }
};

export const getAYDById = async (id) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('토큰이 없습니다. 로그인이 필요합니다.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${API_BASE_URL}/AYD/${id}`, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // 토큰이 만료되었거나 유효하지 않은 경우
        localStorage.removeItem('token'); // 만료된 토큰 제거
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }
      throw new Error('이미지를 불러올 수 없습니다.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('AYD 요청 중 오류 발생:', error);
    throw error;
  }
}; 