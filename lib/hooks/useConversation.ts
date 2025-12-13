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

interface ConversationParticipant {
  conversation_id: string
  conversations: {
    id: string
    created_at: string
  }[]
}

interface ParticipantProfile {
  user_id: string
  profiles: {
    id: string
    username: string
    avatar_url: string | null
    is_online: boolean
  }[]
}

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const fetchConversations = async () => {
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

      // 2. لكل محادثة، جيب المستخدم التاني
      const conversationsWithUsers = await Promise.all(
        (convData || []).map(async (conv: ConversationParticipant) => {
          const conversationId = conv.conversations[0].id

          // جيب المستخدم التاني في المحادثة
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

          const otherUserProfile = (participants as ParticipantProfile[])?.[0]?.profiles?.[0]

          return {
            id: conversationId,
            created_at: conv.conversations[0].created_at,
            other_user: {
              id: otherUserProfile?.id || '',
              username: otherUserProfile?.username || 'مستخدم',
              avatar_url: otherUserProfile?.avatar_url || null,
              is_online: otherUserProfile?.is_online || false
            },
            last_message: lastMessage || null
          }
        })
      )

      // فلتر المحادثات اللي عندها مستخدم تاني
      const validConversations = conversationsWithUsers.filter(
        c => c.other_user.id !== ''
      )

      setConversations(validConversations)
      setLoading(false)
    }

    fetchConversations()

    // استمع للمحادثات الجديدة
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversation_participants' },
        () => {
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return { conversations, loading }
}