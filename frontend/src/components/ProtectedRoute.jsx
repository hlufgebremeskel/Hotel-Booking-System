import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children, role }) {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
      setIsAuthorized(false);
      setIsValidating(false);
      return;
    }

    if (role && role !== userRole) {
      setIsAuthorized(false);
      setIsValidating(false);
      return;
    }

    setIsAuthorized(true);
    setIsValidating(false);
  }, [role]);

  if (isValidating) {
    return null; // or a loading spinner
  }

  if (!isAuthorized) {
    const token = localStorage.getItem('token');
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    if (role) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
