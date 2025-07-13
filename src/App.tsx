import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PipecatClient, RTVIEvent } from '@pipecat-ai/client-js';
import { DailyTransport } from '@pipecat-ai/daily-transport';
import {
  PipecatClientProvider,
  PipecatClientAudio,
  PipecatClientVideo,
  usePipecatClient,
  usePipecatClientTransportState,
  useRTVIClientEvent,
  usePipecatClientCamControl,
  usePipecatClientMicControl,
} from '@pipecat-ai/client-react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Send,
  User,
  Bot,
  Sparkles
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Local Video */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
        <div className="relative bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden aspect-video shadow-2xl">
          <PipecatClientVideo
            participant="local"
            fit="cover"
            mirror={true}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/20 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">You</span>
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bot Video */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
        <div className="relative bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden aspect-video shadow-2xl">
          <PipecatClientVideo
            participant="bot"
            fit="cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/20 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">AI Assistant</span>
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-blue-400" />
            </div>
          </div>
          <div className="absolute top-4 left-4">
            <Sparkles size={20} className="text-purple-400 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Control Panel Component
const ControlPanel: React.FC = () => {
  const pcClient = usePipecatClient();
  const transportState = usePipecatClientTransportState();
  const { enableCam, isCamEnabled } = usePipecatClientCamControl();
  const { enableMic, isMicEnabled } = usePipecatClientMicControl();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const isConnected = transportState === 'connected';

  const handleConnect = useCallback(async () => {
    if (!pcClient) return;
    
    if (isConnected) {
      await pcClient.disconnect();
    } else {
      setIsConnecting(true);
      try {
        await pcClient.connect({
          endpoint: `${import.meta.env.VITE_PIPECAT_API_URL || '/api'}/connect`,
        });
      } catch (error) {
        console.error('Failed to connect:', error);
      } finally {
        setIsConnecting(false);
      }
    }
  }, [pcClient, isConnected]);

  const toggleCamera = useCallback(() => {
    if (enableCam) {
      enableCam(!isCamEnabled);
    }
  }, [enableCam, isCamEnabled]);

  const toggleMicrophone = useCallback(() => {
    if (enableMic) {
      enableMic(!isMicEnabled);
    }
  }, [enableMic, isMicEnabled]);

  return (
    <div className="flex justify-center items-center gap-4 mb-8">
      <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
        {/* Camera Toggle */}
        <button
          onClick={toggleCamera}
          className={`relative group p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
            isCamEnabled 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
              : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50'
          }`}
          disabled={!isConnected}
          title={isCamEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCamEnabled && (
            <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
          )}
          <div className="relative">
            {isCamEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </div>
        </button>

        {/* Microphone Toggle */}
        <button
          onClick={toggleMicrophone}
          className={`relative group p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
            isMicEnabled 
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25' 
              : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
          }`}
          disabled={!isConnected}
          title={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicEnabled && (
            <div className="absolute inset-0 bg-green-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
          )}
          <div className="relative">
            {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </div>
        </button>

        {/* Connect/Disconnect Button */}
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`relative group px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
            isConnected
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25'
          } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className={`absolute inset-0 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity ${
            isConnected ? 'bg-red-500' : 'bg-green-500'
          }`}></div>
          <div className="relative flex items-center gap-3">
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Connecting...</span>
              </>
            ) : isConnected ? (
              <>
                <PhoneOff size={20} />
                <span>Disconnect</span>
              </>
            ) : (
              <>
                <Phone size={20} />
                <span>Connect</span>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

// Chat Interface Component
const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const pcClient = usePipecatClient();
  const transportState = usePipecatClientTransportState();

  const isConnected = transportState === 'connected';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle user transcription events
  useRTVIClientEvent(
    RTVIEvent.UserTranscript,
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
    RTVIEvent.BotLlmText,
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

  // Handle bot transcription events
  useRTVIClientEvent(
    RTVIEvent.BotTranscript,
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
    if (!inputText.trim() || !isConnected || !pcClient) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Send message to bot - this will depend on your specific backend implementation
    try {
      // Example action call - adjust based on your backend
      console.log('Sending message:', inputText);
      // You might need to implement a specific method for sending text messages
    } catch (error) {
      console.error('Failed to send message:', error);
    }

    setInputText('');
  }, [inputText, isConnected, pcClient]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            AI Chat
          </h3>
          {isConnected && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Live</span>
            </div>
          )}
        </div>
        
        {/* Messages Container */}
        <div 
          ref={chatContainerRef}
          className="h-80 overflow-y-auto mb-6 space-y-4 pr-2 custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Sparkles size={24} className="text-white" />
              </div>
              <p className="text-gray-400 text-lg font-medium mb-2">
                {isConnected ? 'Ready to chat!' : 'Connect to start'}
              </p>
              <p className="text-gray-500 text-sm">
                {isConnected ? 'Start speaking or type a message below...' : 'Click the Connect button to begin your AI conversation'}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 animate-fadeIn ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                
                <div
                  className={`group max-w-sm lg:max-w-md px-4 py-3 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white/10 border border-white/20 text-gray-100 shadow-lg'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className="text-xs opacity-70 mt-2">{message.timestamp}</p>
                </div>

                {message.type === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="relative">
          <div className="flex gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Type your message..." : "Connect to start chatting"}
              disabled={!isConnected}
              className="flex-1 bg-transparent text-white placeholder-gray-400 px-4 py-3 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || !isConnected}
              className="group relative bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <Send size={18} className="relative" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Connection Status Component
const ConnectionStatus: React.FC = () => {
  const transportState = usePipecatClientTransportState();
  
  const getStatusConfig = () => {
    switch (transportState) {
      case 'connected':
        return {
          color: 'from-green-400 to-emerald-500',
          bgColor: 'from-green-500/20 to-emerald-500/20',
          text: 'Connected',
          icon: '●'
        };
      case 'connecting':
        return {
          color: 'from-yellow-400 to-orange-500',
          bgColor: 'from-yellow-500/20 to-orange-500/20',
          text: 'Connecting',
          icon: '◐'
        };
      case 'disconnected':
        return {
          color: 'from-red-400 to-red-500',
          bgColor: 'from-red-500/20 to-red-500/20',
          text: 'Disconnected',
          icon: '○'
        };
      default:
        return {
          color: 'from-gray-400 to-gray-500',
          bgColor: 'from-gray-500/20 to-gray-500/20',
          text: 'Unknown',
          icon: '?'
        };
    }
  };

  const status = getStatusConfig();

  return (
    <div className="flex justify-center mb-8">
      <div className={`flex items-center gap-3 bg-gradient-to-r ${status.bgColor} backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 shadow-lg`}>
        <div className={`w-3 h-3 bg-gradient-to-r ${status.color} rounded-full ${
          transportState === 'connecting' ? 'animate-pulse' : ''
        } ${transportState === 'connected' ? 'animate-pulse' : ''}`}></div>
        <span className={`font-medium bg-gradient-to-r ${status.color} bg-clip-text text-transparent`}>
          {status.text}
        </span>
      </div>
    </div>
  );
};

// Main App Component with Provider
const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)]"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(120,219,255,0.2),transparent_50%)]"></div>
      
      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Pipecat React UI
            </h1>
          </div>
          <p className="text-gray-400 text-lg font-medium">
            Next-generation AI voice and video interface
          </p>
        </div>
        
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
