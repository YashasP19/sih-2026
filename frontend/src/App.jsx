import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';
import ComplaintChatbot from './components/ComplaintChatbot';
import Footer from './components/Footer';
import AppRoutes from './routes';
import ServerWakeup from './components/ServerWakeup';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col text-civic-ink dark:text-slate-100 font-sans transition-colors duration-300">
              <Navbar />
              <main className="flex-1">
                <AppRoutes />
              </main>
              <Footer />
              <NotificationToast />
              <ComplaintChatbot />
              <ServerWakeup />
            </div>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
