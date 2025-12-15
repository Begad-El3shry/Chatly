'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User as AuthUser } from '@supabase/supabase-js'

interface User {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  is_online: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingChat, setCreatingChat] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUsers = async () => {
      // جيب المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setCurrentUser(user)

      // جيب كل المستخدمين (ماعدا المستخدم الحالي)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, is_online')
        .neq('id', user.id)
        .order('username')

      if (error) {
        console.error('Error fetching users:', error)
      } else {
        setUsers(data || [])
      }

      setLoading(false)
    }

    getUsers()
  }, [])

  // إنشاء محادثة جديدة أو فتح موجودة
  const startChat = async (otherUserId: string) => {
    if (!currentUser) return
    
    setCreatingChat(otherUserId)

    try {
      // 1. شوف لو في محادثة موجودة بين الاتنين
      const { data: existingConv } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUser.id)

      if (existingConv && existingConv.length > 0) {
        // شوف لو المستخدم التاني موجود في أي محادثة
        for (const conv of existingConv) {
          const { data: otherParticipant } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.conversation_id)
            .eq('user_id', otherUserId)
            .single()

          if (otherParticipant) {
            // المحادثة موجودة، روح عليها
            router.push(`/chat/${conv.conversation_id}`)
            return
          }
        }
      }

      // 2. لو مفيش محادثة، اعمل واحدة جديدة
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert([{}])
        .select()
        .single()

      if (convError) {
        console.error('Error creating conversation:', convError)
        setCreatingChat(null)
        return
      }

      // 3. أضف المستخدمين للمحادثة
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConv.id, user_id: currentUser.id },
          { conversation_id: newConv.id, user_id: otherUserId }
        ])

      if (participantsError) {
        console.error('Error adding participants:', participantsError)
        setCreatingChat(null)
        return
      }

      // 4. روح على المحادثة
      // router.push(`/chat/${newConv.id}`)
    } catch (error) {
      console.error('Error starting chat:', error)
      setCreatingChat(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/chat"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← رجوع
            </Link>
            <h1 className="text-2xl font-bold text-white">👥 المستخدمين</h1>
          </div>
        </div>
      </header>

      {/* Users List */}
      <div className="container mx-auto px-6 py-8">
        {users.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-xl">لا يوجد مستخدمين آخرين</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {user.username?.[0]?.toUpperCase() || '👤'}
                    </div>
                    {user.is_online && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">
                      {user.username}
                    </h3>
                    {user.full_name && (
                      <p className="text-sm text-gray-400">{user.full_name}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {user.is_online ? '🟢 متصل الآن' : '⚫ غير متصل'}
                    </p>
                  </div>
                </div>

                {/* Start Chat Button */}
                <button
                  onClick={() => startChat(user.id)}
                  disabled={creatingChat === user.id}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingChat === user.id ? 'جاري الفتح...' : '💬 بدء محادثة'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}