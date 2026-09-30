import useAuthStore from '../store/authStore';

export const useAuth = () => {
  // --- CHANGE 1: We now also get the 'token' from the store ---
  const { user, token, login, logout } = useAuthStore();
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isContractor = user?.role === 'contractor';

  return { 
    user, 
    // --- CHANGE 2: We now also return the 'token' for components to use ---
    token,
    login, 
    logout, 
    isAuthenticated, 
    isAdmin, 
    isContractor 
  };
};