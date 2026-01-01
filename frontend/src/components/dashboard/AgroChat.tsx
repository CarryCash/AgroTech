import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

const AgroChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: 'Finca El Sol. ¿Tienes dudas sobre las recomendaciones de hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll al último mensaje
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/ia/consultar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pregunta: userMsg }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Esto atrapará errores 500 (como API Key inválida)
                throw new Error(data.detalle || data.error || 'Error en el servidor');
            }

            setMessages(prev => [...prev, {
                role: 'ai',
                content: data.respuesta // Verifica que el backend mande "respuesta"
            }]);
        } catch (error: unknown) {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: `Error: ${(error as Error).message}`
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="bg-[#121212] border border-white/10 w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5">
                    {/* Header del Chat */}
                    <div className="bg-[#9bbd5c] p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[#121212]">
                            <Sparkles className="w-5 h-5" />
                            <span className="font-bold text-lg">AgroIA Chat</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="text-[#121212] hover:bg-black/10 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Cuerpo del Chat */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((m, i) => (
                            <div key={i} className={cn(
                                "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed",
                                m.role === 'user'
                                    ? "ml-auto bg-[#364228] text-white rounded-tr-none"
                                    : "mr-auto bg-[#222] text-gray-300 rounded-tl-none border border-white/5"
                            )}>
                                {m.content}
                            </div>
                        ))}
                        {loading && (
                            <div className="mr-auto bg-[#222] p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-[#9bbd5c]" />
                                <span className="text-xs text-gray-500 italic font-mono">Generando...</span>
                            </div>
                        )}
                    </div>

                    {/* Input de Texto */}
                    <div className="p-4 bg-[#181818] border-t border-white/5 flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Pregunta a la IA..."
                            className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#9bbd5c] transition-all"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={loading}
                            className="bg-[#9bbd5c] text-[#121212] hover:bg-[#8aa852] rounded-xl px-3"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Botón flotante (se activa si el chat está cerrado) */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 rounded-full bg-[#9bbd5c] hover:bg-[#8aa852] shadow-xl hover:scale-110 transition-transform flex items-center justify-center p-0 overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img
                        src="/ia-icon.png" // Usa el icono circular de tu captura
                        alt="IA"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback si la imagen no carga
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <Sparkles className="w-8 h-8 text-[#121212]" />
                </Button>
            )}
        </div>
    );
};

export default AgroChat;