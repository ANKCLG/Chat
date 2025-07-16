import React from 'react';

interface VoiceChatButtonProps {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export const VoiceChatButton: React.FC<VoiceChatButtonProps> = ({
  isActive,
  isListening,
  isSpeaking,
  onStart,
  onStop,
  disabled = false
}) => {
  const handleClick = isActive ? onStop : onStart;
  
  const getButtonText = () => {
    if (isSpeaking) return 'Assistant Speaking...';
    if (isListening) return 'Listening...';
    if (isActive) return 'End Chat';
    return 'Start Voice Chat';
  };

  const getButtonIcon = () => {
    if (isSpeaking) {
      return (
        <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      );
    }
    
    if (isListening) {
      return (
        <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      );
    }

    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
        <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    );
  };

  const getButtonClass = () => {
    let baseClass = `
      inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-full
      transition-all duration-200 transform text-white shadow-lg hover:shadow-xl hover:-translate-y-1
      disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
      focus:outline-none focus:ring-4 focus:ring-blue-500/30
    `;

    if (isSpeaking) {
      return baseClass + ' bg-purple-500 hover:bg-purple-600 animate-pulse';
    } else if (isListening) {
      return baseClass + ' bg-green-500 hover:bg-green-600 animate-pulse';
    } else if (isActive) {
      return baseClass + ' bg-red-500 hover:bg-red-600';
    } else {
      return baseClass + ' bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600';
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={getButtonClass()}
    >
      {getButtonIcon()}
      <span>{getButtonText()}</span>
    </button>
  );
};