'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase, type ChatChannel, type ChatMessage } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { Pin, Send, Hash, MessageSquare, Sparkles } from 'lucide-react';
import { audio } from '@/lib/audio';

export default function CommunityChatPage() {
 const { user } = useAuth();
 const [channels, setChannels] = useState<ChatChannel[]>([]);
 const [activeChannelId, setActiveChannelId] = useState<string>('');
 const [messages, setMessages] = useState<ChatMessage[]>([]);
 const [inputText, setInputText] = useState('');
 const [isSending, setIsSending] = useState(false);
 const messagesEndRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 async function loadChannels() {
 const { data } = await supabase.from('chat_channels').select('*');
 if (data && data.length > 0) {
 setChannels(data);
 setActiveChannelId(data[0].id);
 }
 }
 loadChannels();
 }, []);

 useEffect(() => {
 if (!activeChannelId) return;

 async function loadMessages() {
 const { data } = await supabase
 .from('chat_messages')
 .select('*')
 .eq('channel_id', activeChannelId);
 setMessages(data || []);
 scrollToBottom();
 }
 loadMessages();
 }, [activeChannelId]);

 const scrollToBottom = () => {
 setTimeout(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, 100);
 };

 const handleSendMessage = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!inputText.trim() ||!user?.id ||!activeChannelId) return;

 setIsSending(true);
 audio.play('serve');

 try {
 const newMsg: Partial<ChatMessage> = {
 channel_id: activeChannelId,
 sender_id: user.id,
 content: inputText.trim(),
 message_type: 'text',
 is_pinned: false,
 };

 const { data } = await supabase.from('chat_messages').insert(newMsg).select().single();

 if (data) {
 setMessages((prev) => [...prev, data]);
 }
 setInputText('');
 scrollToBottom();
 } catch (err) {
 console.error('Failed to send message:', err);
 } finally {
 setIsSending(false);
 }
 };

 const activeChannel = channels.find((c) => c.id === activeChannelId);

 return (
 <div className="space-y-6">
 {/* Header */}
 <div>
 <h1
 className="text-2xl sm:text-3xl font-black uppercase text-sl-foreground"
 style={{ fontFamily: 'var(--font-title)' }}
 >
 Community Chat Channels
 </h1>
 <p className="text-xs text-sl-muted font-medium mt-1">
 Real-time channel messaging with fellow ShuttleLions athletes and coaching executives.
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
 {/* Left: Channels List */}
 <div className="lg:col-span-4 shuttle-panel bg-sl-panel p-4 flex flex-col justify-between overflow-y-auto">
 <div className="space-y-3">
 <span className="text-[10px] font-black text-sl-muted uppercase tracking-widest px-2">
 Channels
 </span>
 <div className="space-y-1">
 {channels.map((chan) => {
 const isActive = chan.id === activeChannelId;
 return (
 <button
 key={chan.id}
 onClick={() => {
 audio.play('rally');
 setActiveChannelId(chan.id);
 }}
 className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl font-bold text-xs transition-all text-left ${
 isActive
 ? 'bg-sl-green text-white shadow-md'
 : 'text-sl-foreground hover:bg-sl-green/10'
 }`}
 >
 <span>{chan.icon || ''}</span>
 <span className="truncate">#{chan.name}</span>
 </button>
 );
 })}
 </div>
 </div>
 </div>

 {/* Right: Messages Area */}
 <div className="lg:col-span-8 shuttle-panel bg-sl-panel flex flex-col justify-between overflow-hidden">
 {/* Channel Info Bar */}
 <div className="p-4 border-b border-sl-border/40 bg-sl-panel/60 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="text-lg">{activeChannel?.icon}</span>
 <div>
 <h3 className="text-xs font-black text-sl-foreground uppercase">
 #{activeChannel?.name || 'general'}
 </h3>
 <p className="text-[10px] text-sl-muted truncate max-w-sm">
 {activeChannel?.description}
 </p>
 </div>
 </div>
 </div>

 {/* Messages Scroll Area */}
 <div className="flex-1 p-4 overflow-y-auto space-y-4">
 {messages.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center text-center p-8 text-sl-muted space-y-2">
 <MessageSquare className="w-8 h-8 opacity-40 text-sl-green" />
 <p className="text-xs font-bold">No messages in this channel yet.</p>
 <p className="text-[11px]">Kick off the conversation below!</p>
 </div>
 ) : (
 messages.map((msg) => {
 const isMe = msg.sender_id === user?.id;

 return (
 <div
 key={msg.id}
 className={`flex gap-3 items-start ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
 >
 <div className="w-8 h-8 rounded-full bg-sl-green text-white font-bold text-xs flex items-center justify-center shrink-0">
 {isMe ? user?.full_name?.charAt(0) || 'Me' : 'L'}
 </div>
 <div
 className={`max-w-[75%] p-3.5 rounded-2xl text-xs space-y-1 ${
 isMe
 ? 'bg-sl-green text-white rounded-tr-none shadow-md'
 : 'bg-sl-bg border border-sl-border text-sl-foreground rounded-tl-none'
 }`}
 >
 {msg.is_pinned && (
 <div className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-300">
 <Pin className="w-3 h-3" /> Pinned Announcement
 </div>
 )}
 <p className="leading-relaxed font-medium">{msg.content}</p>
 <p
 className={`text-[9px] font-mono text-right ${
 isMe ? 'text-white/70' : 'text-sl-muted'
 }`}
 >
 {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </p>
 </div>
 </div>
 );
 })
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Send Input Bar */}
 <form onSubmit={handleSendMessage} className="p-3 border-t border-sl-border/40 bg-sl-panel flex gap-2">
 <ShuttleInput
 placeholder={`Message #${activeChannel?.name || 'channel'}...`}
 value={inputText}
 onChange={(e) => setInputText(e.target.value)}
 className="py-2.5 text-xs flex-1"
 />
 <ShuttleButton
 type="submit"
 variant="green"
 disabled={isSending ||!inputText.trim()}
 className="py-2 px-4 text-xs font-black shrink-0"
 >
 <Send className="w-4 h-4" />
 </ShuttleButton>
 </form>
 </div>
 </div>
 </div>
 );
}
