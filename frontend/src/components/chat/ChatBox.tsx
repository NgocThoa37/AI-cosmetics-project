'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { productService } from '@/services/api/product.service';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  recommendedProducts?: Product[];
}

// Mock recommended products data
const mockProducts: Product[] = [];

export const ChatBox: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: 'Xin chào! Mình là chatbot Lumiere Skincare Consultant. Da bạn đang gặp tình trạng gì? Mình rất sẵn lòng tư vấn nhé! 🍃',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes('dầu') || lowerMsg.includes('mụn') || lowerMsg.includes('nhờn')) {
      return 'Với da dầu mụn, mình recommend bạn nên dùng sữa rửa mặt dịu nhẹ, toner cân bằng và serum đặc trị mụn từ BHA. Bạn có thể tham khảo bộ sản phẩm Clear Skin của Lumière nhé! ✨';
    } else if (lowerMsg.includes('khô') || lowerMsg.includes('kích ứng')) {
      return 'Da khô cần được cấp ẩm sâu. Bộ sản phẩm Hydrating Complex với chiết xuất lô hội và dầu jojoba sẽ rất phù hợp với bạn đấy! 💧';
    } else if (lowerMsg.includes('sáng') || lowerMsg.includes('thâm')) {
      return 'Để làm sáng da và mờ thâm, serum Vitamin C kết hợp với kem chống nắng hàng ngày là giải pháp tuyệt vời. Bộ đôi Radiance của Lumière đang được rất nhiều khách hàng yêu thích! 🌟';
    }
    return 'Cảm ơn bạn! Để được tư vấn chính xác nhất, bạn vui lòng truy cập sản phẩm hoặc liên hệ hotline của chúng tôi nhé. 🌸';
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(async () => {
      try {
        const botReply = getBotResponse(textToSend);
        
        // Optional: Fetch products based on keywords
        let matchedProducts: Product[] = [];
        try {
          const products = await productService.getProducts({});
          matchedProducts = products.slice(0, 2);
        } catch (error) {
          console.error('Failed to fetch products:', error);
        }

        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          recommendedProducts: matchedProducts.slice(0, 2),
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (error) {
        const fallbackMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: 'Cảm ơn câu hỏi của bạn! Để được tư vấn chính xác nhất, bạn vui lòng truy cập sản phẩm hoặc liên hệ hotline của chúng tôi nhé.',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsTyping(false);
      }
    }, 800);
  };

  const handleChipClick = (concern: string) => {
    handleSendMessage(concern);
  };

  const handleSelectProduct = (productId: string) => {
    router.push(`/products/${productId}`);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 20 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-brand-dark hover:bg-brand-accent text-white rounded-full flex items-center justify-center shadow-2xl relative transition-colors"
          >
            <MessageSquare size={22} />
            <span className="absolute -top-1 -right-1 bg-brand-accent text-[9px] font-bold px-1.5 py-0.5 rounded-full">AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50 }}
            className="w-[340px] sm:w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border border-brand-warm flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-brand-dark px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-accent/25 rounded-full flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold">Trợ lý Lumière</h4>
                  <span className="text-[10px] text-white/50">Tư vấn da liễu hữu cơ</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 text-white/60 hover:text-white transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-brand-beige/20 text-xs">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-brand-sand flex items-center justify-center text-brand-accent flex-shrink-0">
                      <Bot size={13} />
                    </div>
                  )}
                  <div className="max-w-[78%] space-y-2">
                    <div className={`p-3 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-brand-dark text-white rounded-tr-none' : 'bg-white text-brand-dark rounded-tl-none border border-brand-warm'}`}>
                      <p className="text-xs">{msg.text}</p>
                    </div>
                    {msg.sender === 'bot' && msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-brand-accent/70">✨ Gợi ý sản phẩm:</p>
                        {msg.recommendedProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectProduct(p.id)}
                            className="p-2 rounded-xl bg-white border border-brand-warm hover:border-brand-accent cursor-pointer flex items-center gap-2 transition-all hover:shadow-sm"
                          >
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-brand-sand flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.images?.find(img => img.isMain)?.imageUrl || '/placeholder.jpg'} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-[11px] truncate">{p.name}</h5>
                              <p className="text-[10px] text-brand-accent font-medium">{p.price.toLocaleString()}đ</p>
                            </div>
                            <ChevronRight size={12} className="text-brand-dark/40" />
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="text-[9px] text-brand-dark/35">{msg.timestamp}</span>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-brand-accent flex items-center justify-center text-white flex-shrink-0">
                      <User size={12} />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-brand-sand flex items-center justify-center">
                    <Bot size={13} />
                  </div>
                  <div className="bg-white border border-brand-warm px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chips */}
            <div className="px-3.5 pt-2 flex flex-wrap gap-1.5 pb-2 border-t border-brand-warm bg-white">
              <button onClick={() => handleChipClick('Tư vấn da dầu mụn')} className="bg-white text-[10px] py-1.5 px-3 border border-brand-warm rounded-full hover:border-brand-accent hover:bg-brand-sand transition-colors">
                Da nhờn mụn 🧪
              </button>
              <button onClick={() => handleChipClick('Da khô ráp dùng gì?')} className="bg-white text-[10px] py-1.5 px-3 border border-brand-warm rounded-full hover:border-brand-accent hover:bg-brand-sand transition-colors">
                Da khô ráp 🍃
              </button>
              <button onClick={() => handleChipClick('Sản phẩm bán chạy')} className="bg-white text-[10px] py-1.5 px-3 border border-brand-warm rounded-full hover:border-brand-accent hover:bg-brand-sand transition-colors">
                Sản phẩm hot ✨
              </button>
              <button onClick={() => handleChipClick('Trị thâm mụn')} className="bg-white text-[10px] py-1.5 px-3 border border-brand-warm rounded-full hover:border-brand-accent hover:bg-brand-sand transition-colors">
                Trị thâm mụn 🌟
              </button>
            </div>

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} className="px-4 py-3 border-t border-brand-warm flex gap-2 bg-white">
              <input
                type="text"
                placeholder="Nhập câu hỏi dưỡng da..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 text-xs px-3 py-2.5 rounded-full border border-brand-warm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim() || isTyping} 
                className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center disabled:opacity-40 hover:bg-brand-accent transition-colors"
              >
                <Send size={13} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};