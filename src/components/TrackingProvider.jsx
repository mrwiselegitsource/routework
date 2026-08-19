import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../lib/db';

// Simple session ID generator for unique visitor tracking (lasts for the session)
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('routeworks_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('routeworks_session_id', sessionId);
  }
  return sessionId;
};

export default function TrackingProvider({ children }) {
  const location = useLocation();

  useEffect(() => {
    // Exclude admin routes from public traffic stats
    if (!location.pathname.startsWith('/admin')) {
      const sessionId = getSessionId();
      db.logPageView(location.pathname, sessionId).catch((err) => {
        console.warn('[tracking error]', err);
      });
    }
  }, [location.pathname]);

  return children;
}
