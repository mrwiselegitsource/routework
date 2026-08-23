import React, { useState } from 'react';
import { Mail, Bell, CreditCard, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useCustomerMessages } from '../context/CustomerMessagesContext';
import { Helmet } from 'react-helmet-async';

export default function CustomerMessages() {
  const { messages, markAsRead } = useCustomerMessages();
  const [selectedMessage, setSelectedMessage] = useState(null);

  const getIconForType = (type) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-5 h-5 text-orange-500" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-[#0033a0]" />;
    }
  };

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      markAsRead(msg.id);
    }
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <Helmet>
        <title>Messages - RouteWorks</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Message Center</h1>
        <p className="text-gray-500">Notifications, payment reminders, and system alerts.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col md:flex-row">
        
        {/* Messages List */}
        <div className={`w-full md:w-1/3 border-r border-gray-100 flex flex-col ${selectedMessage ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#0033a0]" /> Inbox
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No messages yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {messages.map(msg => (
                  <button
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors relative flex items-start gap-3 ${
                      selectedMessage?.id === msg.id ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    {!msg.is_read && (
                      <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                    )}
                    <div className="mt-1 shrink-0 bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
                      {getIconForType(msg.type)}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className={`text-sm truncate ${msg.is_read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                        {msg.title}
                      </h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{msg.content}</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className={`w-full md:w-2/3 flex flex-col bg-gray-50/30 ${!selectedMessage ? 'hidden md:flex' : 'flex'}`}>
          {selectedMessage ? (
            <div className="p-6 md:p-8 animate-[fadeIn_0.3s_ease-out]">
              <button 
                onClick={() => setSelectedMessage(null)}
                className="md:hidden mb-6 text-sm font-bold text-[#0033a0] flex items-center gap-1"
              >
                &larr; Back to Inbox
              </button>
              
              <div className="flex items-start gap-4 mb-8">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                  {getIconForType(selectedMessage.type)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedMessage.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Received on {new Date(selectedMessage.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.content}
              </div>
              
              {selectedMessage.order_id && (
                <div className="mt-8">
                  <a 
                    href={`/track?id=${selectedMessage.order_id}`}
                    className="inline-flex items-center justify-center gap-2 bg-[#0033a0] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#002277] transition-colors shadow-lg"
                  >
                    View Order Details
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <Mail className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium text-lg text-gray-500">Select a message to read</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
