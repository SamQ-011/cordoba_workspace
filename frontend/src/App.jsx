import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; 
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import UpdatesPage from './pages/UpdatesPage';
import NotesPage from './pages/NotesPage';
import Layout from './components/Layout'; 
import './App.css';

// Higher-order component for route protection
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    // Professional loading state without emojis
    if (loading) return <div className="loading-state">Initializing System...</div>;
    
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* Protected Workspace Routes */}
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <Layout>
                                <DashboardPage />
                            </Layout>
                        </PrivateRoute>
                    } />

                    {/* Search Route */}
                    <Route path="/search" element={
                        <PrivateRoute>
                            <Layout>
                                <SearchPage />
                            </Layout>
                        </PrivateRoute>
                    } />

                    {/* Updates Route */}
                    <Route path="/updates" element={
                        <PrivateRoute>
                            <Layout>
                                <UpdatesPage />
                            </Layout>
                        </PrivateRoute>
                    } />

                    {/* My Profile Route */}
                    <Route path="/profile" element={
                        <PrivateRoute>
                            <Layout>
                                <ProfilePage />
                            </Layout>
                        </PrivateRoute>
                    } />

                    {/* Notes Route */}
                    <Route path="/notes" element={
                        <PrivateRoute>
                            <Layout>
                                <NotesPage />
                            </Layout>
                        </PrivateRoute>
                    } />

                    {/* Default Redirection */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;