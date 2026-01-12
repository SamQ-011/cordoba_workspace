import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkSession = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/me');
            // Normalización: Acepta .user o la respuesta directa
            setUser(response.data.user || response.data);
        } catch (error) {
            console.error("Session Validation Failed");
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const login = async (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await api.post('/auth/login', formData);
            
            // Extraemos token y datos con fallbacks para evitar undefined
            const token = response.data.access_token;
            const userData = response.data.user_data || response.data.user || response.data;

            if (token) {
                localStorage.setItem('token', token);
                setUser(userData);
                return userData;
            }
        } catch (error) {
            setUser(null);
            throw error; // Re-lanzar para que el componente Login muestre el error
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, checkSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);