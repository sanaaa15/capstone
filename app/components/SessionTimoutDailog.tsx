// components/SessionTimeoutDialog.jsx
import React from 'react';
import { useRouter } from 'next/router';

const SessionTimeoutDialog = ({ onClose }) => {
  const router = useRouter();

  const handleLogin = () => {
    onClose();
    router.push('/login');
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3>Session expired</h3>
        <p>Please login again.</p>
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default SessionTimeoutDialog;
