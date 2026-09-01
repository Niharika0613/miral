// client/src/utils/auth.ts
export const setAuth = (userId: string, userName: string) => {
  localStorage.setItem('userId', userId);
  localStorage.setItem('userName', userName);
  sessionStorage.setItem('userId', userId);
  sessionStorage.setItem('userName', userName);
};

export const logout = () => {
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('userName');
  window.location.href = '/login';
};

export const isLoggedIn = (): boolean => {
  return !!(localStorage.getItem('userId') || sessionStorage.getItem('userId'));
};

export const getCurrentUser = () => {
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
  
  if (!userId) return null;
  
  return {
    id: userId,
    name: userName || 'Candidate',
  };
};
