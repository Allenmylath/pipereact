import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PipecatClient } from '@pipecat-ai/client-js';
import { DailyTransport } from '@pipecat-ai/daily-transport';
import {
  PipecatClientProvider,
  PipecatClientAudio,
  PipecatClientVideo,
  usePipecatClient,
  usePipecatClientTransportState,
  usePipecatClientCamControl,
  usePipecatClientMicControl,
  useRTVIClientEvent,
} from '@pipecat-ai/client-react';
import { RTVIEvent, TransportState } from '@pipecat-ai/client-js';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Send,
  User,
  Bot
} from 'lucide-react';

// Types for chat messages
interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: string;
}

// Create the client instance outside the component to prevent recreation
const client = new PipecatClient({
  transport: new DailyTransport(),
  enableMic: true,
  enableCam: true,
});

// Video Panel Component
const VideoPanel: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Local Video */}
      <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
        <PipecatClientVideo
          participant="local"
          fit="cover"
          mirror={true}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          You
        </div>
      </div>
      
      {/* Bot Video */}
      <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
        <PipecatClientVideo
          participant="bot"
          fit="cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          Bot
        </div>
      </div>
    </div>
  );
};

// Control Panel Component
const ControlPanel: React.FC = () => {
  const client = usePipecatClient();
  const transportState = usePipecatClientTransportState();
  const { enableCam, isCamEnabled } = usePipecatClientCamControl();
  const { enableMic, isMicEnabled } = usePipecatClientMicControl();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const isConnected = transportState === TransportState.Connected;

  const handleConnect = useCallback(async () => {
    if (isConnected) {
      await client.disconnect();
    } else {
      setIsConnecting(true);
      try {
        await client.connect({
          endpoint: `${import.meta.env.VITE_PIPECAT_API_URL || '/api'}/connect`,
          requestData: {
            // Add any custom data your backend requires
          }
        });
      } catch (error) {
        console.error('Failed to connect:', error);
      } finally {
        setIsConnecting(false);
      }
    }
  }, [client, isConnected]);

  const toggleCamera = useCallback(() => {
    enableCam(!isCamEnabled);
  }, [enableCam, isCamEnabled]);

  const toggleMicrophone = useCallback(() => {
    enableMic(!isMicEnabled);
  }, [enableMic, isMicEnabled]);

  return (
    <div className="flex justify-center gap-4 mb-6">
      {/* Camera Toggle */}
      <button
        onClick={toggleCamera}
        className={`p-3 rounded-full transition-colors ${
          isCamEnabled 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
        }`}
        disabled={!isConnected}
        title={isCamEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isCamEnabled ? <Video size={20} /> : <VideoOff size={20} />}
      </button>

      {/* Microphone Toggle */}
      <button
        onClick={toggleMicrophone}
        className={`p-3 rounded-full transition-colors ${
          isMicEnabled 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
        disabled={!isConnected}
        title={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      {/* Connect/Disconnect Button */}
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className={`px-6 py-3 rounded-full font-medium transition-colors ${
          isConnected
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'
        } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2">
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Connecting...
            </>
          ) : isConnected ? (
            <>
              <PhoneOff size={20} />
              Disconnect
            </>
          ) : (
            <>
              <Phone size={20} />
              Connect
            </>
          )}
        </div>
      </button>
    </div>
  );
};

// Chat Interface Component
const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const client = usePipecatClient();
  const transportState = usePipecatClientTransportState();

  const isConnected = transportState === TransportState.Connected;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle user transcription events
  useRTVIClientEvent(
    RTVIEvent.UserTranscription,
    useCallback((data: any) => {
      if (data.final) {
        const message: ChatMessage = {
          id: Date.now().toString(),
          type: 'user',
          text: data.text,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, message]);
      }
    }, [])
  );

  // Handle bot text events
  useRTVIClientEvent(
    RTVIEvent.BotLLMText,
    useCallback((data: any) => {
      const message: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        text: data.text,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, message]);
    }, [])
  );

  // Handle manual text input
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || !isConnected) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Send message to bot (you might need to implement this based on your backend)
    try {
      // This would depend on your specific implementation
      // await client.sendMessage(inputText);
      console.log('Sending message:', inputText);
    } catch (error) {
      console.error('Failed to send message:', error);
    }

    setInputText('');
  }, [inputText, isConnected, client]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Chat</h3>
      
      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto mb-4 space-y-3 chat-container"
      >
        {messages.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            {isConnected ? 'Start speaking or type a message...' : 'Connect to start chatting'}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'bot' && (
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
              </div>

              {message.type === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isConnected ? "Type a message..." : "Connect to chat"}
          disabled={!isConnected}
          className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputText.trim() || !isConnected}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

// Connection Status Component
const ConnectionStatus: React.FC = () => {
  const transportState = usePipecatClientTransportState();
  
  const getStatusColor = () => {
    switch (transportState) {
      case TransportState.Connected:
        return 'bg-green-500';
      case TransportState.Connecting:
        return 'bg-yellow-500';
      case TransportState.Disconnected:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (transportState) {
      case TransportState.Connected:
        return 'Connected';
      case TransportState.Connecting:
        return 'Connecting';
      case TransportState.Disconnected:
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
      <span className="text-sm text-gray-300">{getStatusText()}</span>
    </div>
  );
};

// Main App Component with Provider
const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-8">Pipecat React UI</h1>
        
        <ConnectionStatus />
        <VideoPanel />
        <ControlPanel />
        <ChatInterface />
        
        {/* Hidden audio element for bot audio */}
        <PipecatClientAudio />
      </div>
    </div>
  );
};

// Root App Component
const App: React.FC = () => {
  return (
    <PipecatClientProvider client={client}>
      <AppContent />
    </PipecatClientProvider>
  );
};

export default App;
