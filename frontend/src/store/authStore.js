import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: null,
    token: null,

    login: (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        set({ user: userData, token: token });
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },

    // New action to explicitly load state from localStorage
    hydrate: () => {
        try {
            const user = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            if (user && token) {
                set({ user: JSON.parse(user), token: token });
            }
        } catch (e) {
            console.error("Error hydrating auth store:", e);
        }
    }
}));

export default useAuthStore;