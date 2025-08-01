const API_BASE_URL = 'http://localhost:8080';

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
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/AYD/${id}`, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      if (response.status === 403) {
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