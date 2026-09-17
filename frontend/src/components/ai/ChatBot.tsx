'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Send, X, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { axiosClient } from '@/plugins/axios.config';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
  skinTypeAdvice?: string;
}

export default function ChatBot() {
  const router = useRouter();
  const { isAuthenticated, user } = useCustomerAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `✨ Chào bạn! Tôi là trợ lý chăm sóc da của Lumière.

Tôi có thể:
🧴 Tư vấn chu trình skincare phù hợp với da của bạn
🔍 Gợi ý sản phẩm phù hợp với tình trạng da và ngân sách
💡 Giải đáp thắc mắc về chăm sóc da

Hãy kể cho tôi về làn da của bạn nhé! 🌸`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await axiosClient.post('/ai/chat', {
        message: userMessage.content,
        userId: user?.id || 'anonymous', // ✅ GỬI USER ID
        history,
      });

      // ✅ SỬA: Đọc đúng cấu trúc response
      const data = response.data.data || response.data;

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message, // ✅ SỬA: message thay vì response
        products: data.suggestedProducts || [],
        skinTypeAdvice: data.skinTypeAdvice, // ✅ THÊM
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau! 😅',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleProductClick = (slug: string) => {
    router.push(`/products/${slug}`);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-accent rounded-full shadow-lg flex items-center justify-center hover:bg-brand-accent/90 transition-all hover:scale-105 group"
      >
        <Sparkles size={24} className="text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-brand-warm overflow-hidden transition-all">
      {/* Header */}
      <div className="bg-brand-accent px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-white" />
          <span className="font-serif text-white font-bold">AI Tư vấn da</span>
          <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded text-white"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-3 bg-brand-beige/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-brand-accent text-white rounded-br-none'
                      : 'bg-white border border-brand-warm text-brand-dark rounded-bl-none'
                  }`}
                >
                  <div className={`text-sm ${msg.role === 'user' ? 'text-white' : 'text-brand-dark/90'} leading-relaxed`}>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc ml-4 mt-1">{children}</ul>,
                        li: ({ children }) => <li className="mb-0.5">{children}</li>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* ✅ HIỂN THỊ LỜI KHUYÊN LOẠI DA */}
                  {msg.skinTypeAdvice && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">{msg.skinTypeAdvice}</p>
                    </div>
                  )}

                  {/* Product suggestions */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-brand-accent">🛍️ Sản phẩm gợi ý:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.products.map((product: any) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product.slug)}
                            className="bg-brand-sand/50 hover:bg-brand-sand px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 border border-brand-warm"
                          >
                            {product.image && (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={24}
                                height={24}
                                className="rounded object-cover"
                                unoptimized
                              />
                            )}
                            <span className="font-medium">{product.name}</span>
                            <span className="text-brand-accent font-bold">
                              {new Intl.NumberFormat('vi-VN').format(product.price)}đ
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-brand-warm rounded-2xl rounded-bl-none px-4 py-2.5">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-brand-dark/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-brand-dark/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-brand-dark/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-brand-warm bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi về da của bạn..."
                className="flex-1 px-4 py-2.5 border border-brand-warm rounded-xl focus:outline-none focus:border-brand-accent text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-4 py-2.5 bg-brand-accent text-white rounded-xl hover:bg-brand-accent/90 disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[10px] text-brand-dark/40 mt-1 text-center">
              AI được hỗ trợ bởi Gemini • Chỉ tư vấn về chăm sóc da
            </p>
          </div>
        </>
      )}
    </div>
  );
}