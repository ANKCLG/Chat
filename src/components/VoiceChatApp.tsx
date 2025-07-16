import React from 'react';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { VoiceChatButton } from './VoiceChatButton';
import { StatusDisplay } from './StatusDisplay';

export const VoiceChatApp: React.FC = () => {
  const voiceChat = useVoiceChat();

  if (!voiceChat.isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-pink-600 to-purple-800 flex items-center justify-center p-4">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-4">❌ Not Supported</h1>
          <p className="text-xl text-white/90 mb-4">
            Your browser doesn't support voice features.
          </p>
          <p className="text-white/70 text-sm">
            Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-800 flex items-center justify-center p-4">
      <div className="text-center bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
            🎙️ Voice Chat Assistant
          </h1>
          <p className="text-xl text-white/90 drop-shadow">
            A local AI assistant powered by your browser
          </p>
        </div>

        <div className="mb-6">
          <VoiceChatButton
            isActive={voiceChat.isActive}
            isListening={voiceChat.isListening}
            isSpeaking={voiceChat.isSpeaking}
            onStart={voiceChat.startVoiceChat}
            onStop={voiceChat.stopVoiceChat}
          />
        </div>

        <StatusDisplay 
          status={voiceChat.status} 
          statusType={voiceChat.statusType}
          transcript={voiceChat.transcript}
          lastResponse={voiceChat.lastResponse}
        />

        <div className="mt-8 p-4 bg-white/10 rounded-xl border-l-4 border-green-500">
          <div className="text-white/90 text-sm">
            <strong className="text-green-400">✅ Local Assistant:</strong> No API keys required. 
            Works entirely in your browser using Web Speech API.
          </div>
        </div>

        <div className="mt-6 text-white/70 text-xs">
          <p>Try saying: "Hello", "What time is it?", "Tell me a joke", or just chat naturally!</p>
        </div>
      </div>
    </div>
  );
};