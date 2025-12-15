'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface Message {
  id: string
  content: string
  user_id: string
  created_at: string
  profiles: {
    username: string
  }
}

interface OtherUser {
  id: string
  username: string
  is_online: boolean
  avatar_url: string | null
}

export default function PrivateChatPage() {
  const params = useParams()
  const conversationId = params.conversationId as string
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // جيب المستخدم الحالي
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
    }
    getUser()
  }, [])

  // جيب المستخدم الآخر في المحادثة
  useEffect(() => {
    if (!user || !conversationId) return

    const fetchOtherUser = async () => {
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select(`
          user_id,
          profiles (
            id,
            username,
            is_online,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .neq('user_id', user.id)
        .single()

      if (participants) {
        const profile = Array.isArray(participants.profiles) 
          ? participants.profiles[0] 
          : participants.profiles
        
        setOtherUser({
          id: profile.id,
          username: profile.username,
          is_online: profile.is_online,
          avatar_url: profile.avatar_url
        })
      }
    }

    fetchOtherUser()
  }, [user, conversationId])

  // جيب الرسائل
  useEffect(() => {
    if (!user || !conversationId) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          user_id,
          created_at,
          profiles (username)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
      } else {
        const formattedMessages = (data || []).map((msg) => ({
          ...msg,
          profiles: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles
        }))
        setMessages(formattedMessages)
      }
      
      setLoading(false)
    }

    fetchMessages()

    // استمع للرسائل الجديدة
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', payload.new.user_id)
            .single()

          const newMsg = {
            ...payload.new,
            profiles: profile
          } as Message

          setMessages((prev) => [...prev, newMsg])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, conversationId])

  // إرسال رسالة
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !user || sending) return

    setSending(true)

    const { error } = await supabase
      .from('messages')
      .insert([
        {
          content: newMessage,
          user_id: user.id,
          conversation_id: conversationId,
          is_private: true
        }
      ])

    if (error) {
      console.error('Error sending message:', error)
    } else {
      setNewMessage('')
    }

    setSending(false)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Chat Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {otherUser?.username?.[0]?.toUpperCase() || '?'}
            </div>
            {otherUser?.is_online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
            )}
          </div>

          {/* User Info */}
          <div>
            <h2 className="text-white font-semibold text-lg">
              {otherUser?.username || 'مستخدم'}
            </h2>
            <p className="text-sm text-gray-400">
              {otherUser?.is_online ? '🟢 متصل الآن' : '⚫ غير متصل'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-[#0a0e17]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-20 h-20 mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg">لا توجد رسائل بعد</p>
            <p className="text-sm text-gray-600 mt-2">ابدأ المحادثة الآن! 👋</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwn = message.user_id === user?.id

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
                      isOwn
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-700 text-white rounded-bl-sm'
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs text-blue-300 mb-1 font-semibold">
                        {message.profiles?.username || 'مستخدم'}
                      </p>
                    )}
                    <p className="break-words leading-relaxed">{message.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <p className="text-xs opacity-70">
                        {new Date(message.created_at).toLocaleTimeString('ar', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {isOwn && (
                        <svg className="w-4 h-4 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form
        onSubmit={sendMessage}
        className="bg-gray-800 border-t border-gray-700 px-6 py-4"
      >
        <div className="flex items-center gap-3">
          {/* Emoji Button */}
          <button
            type="button"
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Input */}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالتك..."
            className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            disabled={sending}
          />

          {/* Attach Button */}
          <button
            type="button"
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
          >
            {sending ? (
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}