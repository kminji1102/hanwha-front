// VueCode API 호출 함수
export const submitVueCode = async (vueCode, token) => {
  try {
    const response = await fetch('/vueCode/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        vueCode: vueCode
      })
    });

    if (!response.ok) {
      throw new Error('코드 제출에 실패했습니다.');
    }

    const result = await response.text();
    return result;
  } catch (error) {
    console.error('VueCode 제출 오류:', error);
    throw error;
  }
};
