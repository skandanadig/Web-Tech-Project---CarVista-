import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! I\'m CarVista Bot. How can I help you find your perfect car today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chatbot', { message: userMessage });
      const { message, cars } = response.data;

      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: message,
        cars: cars || []
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    'Show me SUVs',
    'Cars under 10 lakhs',
    'Available brands',
    'Automatic cars'
  ];

  const handleQuickAction = (action) => {
    setInput(action);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-110"
          aria-label="Open chatbot"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[500px] flex flex-col">
          {/* Header */}
          <div className="bg-primary-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-bold">CarVista Bot</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-700 p-1 rounded"
              aria-label="Close chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index}>
                <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-800 shadow'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
                
                {/* Car Suggestions */}
                {msg.cars && msg.cars.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.cars.map((car) => (
                      <Link
                        key={car.id}
                        to={`/car/${car.id}`}
                        className="block bg-white p-3 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                      >
                        <p className="font-bold text-gray-800">{car.brand} {car.model}</p>
                        <p className="text-sm text-gray-600">
                          {car.bodyType} • {car.fuelType} • {car.transmission}
                        </p>
                        <p className="text-primary-600 font-semibold mt-1">
                          ₹{(car.price / 100000).toFixed(2)} Lakhs
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-lg shadow">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="p-3 border-t bg-white">
              <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
