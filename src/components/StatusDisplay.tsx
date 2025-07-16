import React from 'react';

interface StatusDisplayProps {
  status: string;
  statusType: 'success' | 'error' | 'warning' | 'loading' | 'idle';
  transcript?: string;
  lastResponse?: string;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ 
  status, 
  statusType, 
  transcript, 
  lastResponse 
}) => {
  const getStatusIcon = () => {
    switch (statusType) {
      case 'success':
        return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-red-400 rounded-full"></div>;
      case 'warning':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>;
      case 'loading':
        return <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  const getStatusColor = () => {
    switch (statusType) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'loading': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-center gap-3 min-h-[2rem]">
        {getStatusIcon()}
        <span className={`text-base ${getStatusColor()}`}>
          {status}
        </span>
      </div>

      {transcript && (
        <div className="bg-white/10 rounded-lg p-3 border-l-4 border-blue-400">
          <div className="text-blue-300 text-sm font-medium mb-1">You said:</div>
          <div className="text-white text-sm">{transcript}</div>
        </div>
      )}

      {lastResponse && (
        <div className="bg-white/10 rounded-lg p-3 border-l-4 border-purple-400">
          <div className="text-purple-300 text-sm font-medium mb-1">Assistant:</div>
          <div className="text-white text-sm">{lastResponse}</div>
        </div>
      )}
    </div>
  );
};