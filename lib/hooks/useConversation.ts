'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Conversation {
  id: string
  created_at: string
  other_user: {
    id: string
    username: string
    avatar_url: string | null
    is_online: boolean
  }
  last_message: {
    content: string
    created_at: string
  } | null
}

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(!!userId)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) {
      return
    }

    const fetchConversations = async () => {
      try {
        console.log('Fetching conversations for user:', userId)

        // 1. جيب كل المحادثات بتاعة المستخدم
        const { data: convData, error: convError } = await supabase
          .from('conversation_participants')
          .select(`
            conversation_id,
            conversations (
              id,
              created_at
            )
          `)
          .eq('user_id', userId)

        if (convError) {
          console.error('Error fetching conversations:', convError)
          setLoading(false)
          return
        }

        if (!convData || convData.length === 0) {
          console.log('No conversations found')
          setConversations([])
          setLoading(false)
          return
        }

        // 2. لكل محادثة، جيب المستخدم التاني
        const conversationsWithUsers = await Promise.all(
          convData.map(async (conv) => {
            const conversation = Array.isArray(conv.conversations) 
              ? conv.conversations[0] 
              : conv.conversations

            if (!conversation) {
              return null
            }

            const conversationId = conversation.id

            // جيب المستخدم التاني
            const { data: participants } = await supabase
              .from('conversation_participants')
              .select(`
                user_id,
                profiles (
                  id,
                  username,
                  avatar_url,
                  is_online
                )
              `)
              .eq('conversation_id', conversationId)
              .neq('user_id', userId)

            // جيب آخر رسالة
            const { data: lastMessage } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('conversation_id', conversationId)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()

            const participant = Array.isArray(participants) && participants.length > 0
              ? participants[0]
              : null

            if (!participant) {
              return null
            }

            const profile = Array.isArray(participant.profiles)
              ? participant.profiles[0]
              : participant.profiles

            if (!profile) {
              return null
            }

            return {
              id: conversationId,
              created_at: conversation.created_at,
              other_user: {
                id: profile.id || '',
                username: profile.username || 'مستخدم',
                avatar_url: profile.avatar_url || null,
                is_online: profile.is_online || false
              },
              last_message: lastMessage || null
            }
          })
        )

        const validConversations = conversationsWithUsers.filter(
          (c): c is Conversation => c !== null && c.other_user.id !== ''
        )

        // رتب المحادثات حسب آخر رسالة (الأحدث أولاً)
        validConversations.sort((a, b) => {
          const dateA = a.last_message?.created_at || a.created_at
          const dateB = b.last_message?.created_at || b.created_at
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        })

        console.log('Valid conversations:', validConversations)
        setConversations(validConversations)
        setLoading(false)
      } catch (error) {
        console.error('Unexpected error:', error)
        setLoading(false)
      }
    }

    fetchConversations()

    // استمع للرسائل الجديدة في كل المحادثات 🔥
    const messagesChannel = supabase
      .channel('all-messages-updates')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `is_private=eq.true` // بس الرسائل الخاصة
        },
        async (payload) => {
          console.log('New message received:', payload.new)
          
          const newMessage = payload.new
          const conversationId = newMessage.conversation_id

          // شوف لو المحادثة دي للمستخدم الحالي
          const { data: isParticipant } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('conversation_id', conversationId)
            .eq('user_id', userId)
            .single()

          if (isParticipant) {
            // حدّث المحادثات كلها
            fetchConversations()
          }
        }
      )
      .subscribe()

    // استمع لتغييرات المحادثات
    const participantsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversation_participants' },
        () => {
          console.log('Conversation change detected')
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(participantsChannel)
    }
  }, [userId])

  return { conversations, loading }
}