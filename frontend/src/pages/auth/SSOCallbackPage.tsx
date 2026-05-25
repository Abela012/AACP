import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

const SSOCallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 1800); // 1.8 seconds callback delay as requested

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
      <div className="flex flex-col items-center max-w-sm w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        {/* Spinning Loader Animation */}
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mb-6"></div>
        
        {/* Message */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying your account...</h2>
        
        {/* Helper Text */}
        <p className="text-sm text-gray-500">Please wait while we complete your sign-in</p>
      </div>

      {/* Background handler to complete Clerk auth callback processing */}
      <div className="hidden">
        <AuthenticateWithRedirectCallback
          signInForceRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
};

export default SSOCallbackPage;
