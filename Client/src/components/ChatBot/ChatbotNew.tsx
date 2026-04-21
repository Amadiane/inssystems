import React,{ useState, useEffect, useRef } from 'react';
// import avatar2 from "chatbotAssets/image/avatar2.png";

interface Message {
  text: string;
  type: 'user' | 'bot';
  language?: string;
  suggestions?: string[];
  id: string; // Unique ID for each message
  isSpeaking?: boolean; // Track speaking state per message
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [showBrowserWarning, setShowBrowserWarning] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voiceDropdowns, setVoiceDropdowns] = useState<Record<string, boolean>>({});
  const [messageWithFeedback, setMessageWithFeedback] = useState<string | null>(null);

  // Initialize speech recognition and voices
  useEffect(() => {
    let recognition: any = null;

    try {
      // @ts-ignore - SpeechRecognition is not in the TypeScript types
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; // Default language
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
      } else {
        setShowBrowserWarning(true);
      }
    } catch (e) {
      console.error('Speech recognition not supported:', e);
      setShowBrowserWarning(true);
    }

    // Initialize available voices
    const initializeVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const filteredVoices = voices.filter(voice => voice.lang.startsWith('en'));
        if (filteredVoices.length > 0) {
          setSelectedVoice(filteredVoices[0]);
        } else if (voices.length > 0) {
          setSelectedVoice(voices[0]);
        }
      }
    };

    if ('speechSynthesis' in window) {
      initializeVoices();
      window.speechSynthesis.onvoiceschanged = initializeVoices;
    }

    // Set up speech recognition event handlers
    if (recognition) {
      recognition.onresult = (event: any) => {
        const voiceText = event.results[0][0].transcript;
        setInputValue(voiceText);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
    }

    // Cleanup function
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, messageWithFeedback]);

  // Generate a unique ID for messages
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  // Speak text using selected voice
  const speakText = (text: string, messageId: string, language = 'en') => {
    if ('speechSynthesis' in window && speechEnabled) {
      // Stop any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.lang = language;

      // Set the speaking state for this message
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, isSpeaking: true } 
            : { ...msg, isSpeaking: false }
        )
      );

      // When speech ends, update the state
      utterance.onend = () => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId ? { ...msg, isSpeaking: false } : msg
          )
        );
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle speech synthesis on/off for a specific message
  const toggleSpeech = (text: string, messageId: string, language = 'en') => {
    // Find the current message
    const currentMessage = messages.find(msg => msg.id === messageId);
    
    if (currentMessage?.isSpeaking) {
      // If currently speaking, stop it
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      // Update speaking state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? { ...msg, isSpeaking: false } : msg
        )
      );
    } else {
      // Start speaking this message
      speakText(text, messageId, language);
    }
  };

  // Start voice recognition
  const startVoiceRecognition = () => {
    try {
      // @ts-ignore
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'en-US';
      recognition.start();
      setIsRecording(true);

      recognition.onresult = (event: any) => {
        const voiceText = event.results[0][0].transcript;
        setInputValue(voiceText);
        setIsRecording(false);
        // Send message automatically when using voice
        sendMessage(voiceText);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsRecording(false);
    }
  };

  // Handle avatar drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  };

  // Handle avatar dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Add boundaries to prevent dragging outside the viewport
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const avatarWidth = 100; // Width of the avatar
      const avatarHeight = 100; // Height of the avatar
      
      const boundedX = Math.max(0, Math.min(newX, viewportWidth - avatarWidth));
      const boundedY = Math.max(0, Math.min(newY, viewportHeight - avatarHeight));
      
      setPosition({ x: boundedX, y: boundedY });
    }
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners for dragging
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Toggle voice dropdown visibility for a specific message
  const toggleVoiceDropdown = (messageId: string) => {
    setVoiceDropdowns(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Send message to the chatbot
  const sendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    setShowWelcome(false);
    
    // Clear any existing satisfaction buttons
    setMessageWithFeedback(null);
    
    // Add user message with unique ID
    const userId = generateId();
    setMessages(prev => [...prev, { 
      text: messageText, 
      type: 'user',
      id: userId
    }]);
    
    setInputValue('');

    try {
      // API call to your chatbot backend
      const response = await fetch('https://chatbot02.tamtechsolution.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      
      // Add bot response with unique ID
      const botId = generateId();
      const botMessage = {
        text: data.response,
        type: 'bot' as const,
        language: data.language || 'en',
        suggestions: data.suggestions || [],
        id: botId,
        isSpeaking: false
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Read bot response aloud if speech is enabled
      if (speechEnabled) {
        speakText(data.response, botId, data.language || 'en');
      }
      
      // Show satisfaction buttons for this message
      setMessageWithFeedback(botId);
      
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages(prev => [
        ...prev,
        { 
          text: 'Une erreur est survenue. Veuillez réessayer.', 
          type: 'bot',
          id: generateId(),
          isSpeaking: false
        }
      ]);
    }
  };

  // Handle user feedback
  const handleFeedback = (isPositive: boolean) => {
    // Clear the feedback prompt
    setMessageWithFeedback(null);
    
    // Add feedback response as a new message
    if (isPositive) {
      setMessages(prev => [...prev, { 
        text: 'Merci pour votre retour positif ! 😊', 
        type: 'bot',
        id: generateId(),
        isSpeaking: false
      }]);
    } else {
      setMessages(prev => [
        ...prev, 
        { 
          text: 'Nous sommes désolés pour cela. Si vous avez besoin d\'aide supplémentaire, contactez-nous.', 
          type: 'bot',
          id: generateId(),
          isSpeaking: false
        }
      ]);
    }
  };

  // Select voice from dropdown
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>, messageId: string) => {
    const voices = window.speechSynthesis.getVoices();
    const newVoice = voices[parseInt(e.target.value)];
    setSelectedVoice(newVoice);
    
    // Hide the dropdown
    setVoiceDropdowns(prev => ({
      ...prev,
      [messageId]: false
    }));
  };

  // Handle Enter key press to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Avatar */}
      <div 
        className="fixed bottom-5 right-10 z-50 cursor-pointer"
        style={{ 
          left: position.x > 0 ? `${position.x}px` : 'auto',
          top: position.y > 0 ? `${position.y}px` : 'auto',
          animation: 'wave-animation 2s infinite',
          width: '100px',
          height: '100px',
        }}
        onClick={() => setIsChatOpen(true)}
        onMouseDown={handleMouseDown}
      >
        <img 
          src="/chatbotAssets/image/avatar2.png"
          alt="Chatbot Avatar" 
          width={100} 
          height={100} 
          className="rounded-lg"
        />
      </div>
      
      {/* Chatbot Modal */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-20 z-50 w-[350px] h-[500px] bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-purple-900 text-white px-4 py-3 flex justify-between items-center">
            <h4 className="text-lg font-medium">Tambot</h4>
            <button 
              onClick={() => setIsChatOpen(false)} 
              className="text-2xl font-bold"
            >
              &times;
            </button>
          </div>
          
          {/* Browser Warning Alert */}
          {showBrowserWarning && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 max-w-[300px] z-50">
              <div className="bg-amber-500 text-white px-3 py-2 rounded shadow">
                <div className="flex justify-between items-center">
                  <h6 className="font-bold">Browser Not Supported</h6>
                  <button 
                    onClick={() => setShowBrowserWarning(false)} 
                    className="text-white"
                  >
                    &times;
                  </button>
                </div>
                <p className="text-sm">Speech recognition is not supported in this browser. Please use a different browser.</p>
              </div>
            </div>
          )}
          
          {/* Chat Body */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 p-4 overflow-y-auto relative"
          >
            {/* Messages */}
            <div className="flex flex-col min-h-full">
              {messages.map((message) => (
                <div key={message.id} className="mb-4">
                  {/* Message content */}
                  <div 
                    className={`relative p-3 rounded-lg max-w-[90%] ${
                      message.type === 'user' 
                        ? 'ml-auto bg-purple-900 text-white' 
                        : 'mr-auto bg-gray-200 text-gray-800'
                    }`}
                  >
                    {message.text}
                    
                    {/* Button container for bot messages */}
                    {message.type === 'bot' && (
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          onClick={() => toggleSpeech(message.text, message.id, message.language)}
                          className="border-none bg-transparent cursor-pointer text-lg"
                        >
                          {message.isSpeaking ? '🔊' : '🔇'}
                        </button>
                        
                        <button 
                          onClick={() => toggleVoiceDropdown(message.id)}
                          className="border-none bg-transparent cursor-pointer text-lg"
                          title="Choose voice"
                        >
                          🗣️
                        </button>
                        
                        {voiceDropdowns[message.id] && (
                          <select 
                            className="mt-2 p-2 bg-gray-100 rounded-lg text-sm text-purple-900 font-medium w-full"
                            onChange={(e) => handleVoiceChange(e, message.id)}
                            value={selectedVoice ? window.speechSynthesis.getVoices().indexOf(selectedVoice) : 0}
                          >
                            {window.speechSynthesis.getVoices().map((voice, i) => (
                              <option key={i} value={i}>
                                {voice.name} ({voice.lang})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                    
                    {/* Suggestions for bot messages */}
                    {message.type === 'bot' && message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 w-full">
                        <select 
                          className="w-full p-2 bg-gray-100 rounded-lg text-sm text-purple-900 font-medium"
                          onChange={(e) => {
                            if (e.target.value) {
                              sendMessage(e.target.value);
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Suggestions...</option>
                          {message.suggestions.map((suggestion, i) => (
                            <option key={i} value={suggestion}>
                              {suggestion}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  
                  {/* Satisfaction buttons placed directly under the message */}
                  {messageWithFeedback === message.id && (
                    <div className="flex justify-center mt-2 gap-2">
                      <button 
                        onClick={() => handleFeedback(true)}
                        className="bg-purple-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-900 transition-colors"
                      >
                        😊 Oui
                      </button>
                      <button 
                        onClick={() => handleFeedback(false)}
                        className="bg-amber-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-amber-600 transition-colors"
                      >
                        😞 Non
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Welcome Message */}
            {showWelcome && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center p-4 bg-gray-200 rounded-lg text-center w-4/5">
                <img 
                  src="/chatbotAssets/image/avatar2.png"
                  alt="Welcome Avatar" 
                  width={100} 
                  height={100} 
                  className="mb-3"
                />
                <p className="text-gray-800">Welcome to our chat! How can I assist you today?</p>
              </div>
            )}
          </div>
          
          {/* Footer Input Area */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-full text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              <button 
                onClick={() => startVoiceRecognition()}
                disabled={isRecording}
                className={`w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center ${
                  isRecording ? 'bg-red-100' : 'bg-gray-100'
                }`}
              >
                <span className="text-lg">{isRecording ? '🎙...' : '🎤'}</span>
              </button>
              
              <button 
                onClick={() => sendMessage()}
                className="bg-purple-900 text-white px-4 py-2 rounded-full hover:bg-purple-800 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      {/* <style jsx>{`
        @keyframes wave-animation {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(10deg); }
          40% { transform: rotate(-8deg); }
          60% { transform: rotate(10deg); }
          80% { transform: rotate(-8deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style> */}
    </>
  );
}