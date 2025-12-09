import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  }[type];

  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  }[type];

  return (
    <div className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 ${
      bgColor
    } text-white px-6 py-3 rounded-lg shadow-2xl slide-in ${
      !isVisible ? 'fade-out' : ''
    } z-50 min-w-[300px] max-w-md text-center flex items-center justify-center gap-3`}>
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default Notification;