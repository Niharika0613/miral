// client/src/utils/auth.ts
export const logout = () => {
  // Clear all auth data
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('userName');
  
  // Force page reload to reset app state
  window.location.href = '/login';
};

export const isLoggedIn = (): boolean => {
  return !!sessionStorage.getItem('userId');
};

export const getCurrentUser = () => {
  const userId = sessionStorage.getItem('userId');
  const userName = sessionStorage.getItem('userName');
  
  if (!userId) return null;
  
  return {
    id: userId,
    name: userName || '',
  };
};