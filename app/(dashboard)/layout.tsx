"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConversations } from "@/lib/hooks/useConversation";
import { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const { conversations, loading: convsLoading } = useConversations(user?.id);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      // جيب البروفايل
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      setLoading(false);
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Sidebar - قائمة المحادثات */}
      <div className="w-full md:w-96 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {profile?.username?.[0]?.toUpperCase() || "👤"}
                </div>
                {profile?.is_online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                )}
              </div>

              {/* User Info */}
              <div>
                <h2 className="text-white font-semibold">
                  {profile?.username}
                </h2>
                <p className="text-xs text-gray-400">نشط الآن</p>
              </div>
            </div>

            {/* Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-white hover:bg-gray-600 transition-colors"
                  >
                    👤 الملف الشخصي
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-white hover:bg-gray-600 transition-colors"
                  >
                    ⚙️ الإعدادات
                  </Link>
                  <hr className="my-2 border-gray-600" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-600 transition-colors"
                  >
                    🚪 تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-gray-800 border-b border-gray-700">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن محادثة..."
              className="w-full bg-gray-700 text-white px-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-800 border-b border-gray-700">
          <Link
            href="/chat"
            className="flex-1 text-center py-3 text-blue-400 border-b-2 border-blue-400 font-semibold"
          >
            💬 المحادثات
          </Link>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">جاري التحميل...</div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 px-6 text-center">
              <svg
                className="w-20 h-20 mb-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-lg mb-2">لا توجد محادثات بعد</p>
              <p className="text-sm mb-4">
                ابدأ محادثة جديدة من قائمة المستخدمين
              </p>
              <Link
                href="/users"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                تصفح المستخدمين
              </Link>
            </div>
          ) : (
            conversations.map((conv) => {
              // شوف لو آخر رسالة جديدة (أقل من دقيقة)
              const isNewMessage = conv.last_message
                ? Date.now() -
                    new Date(conv.last_message.created_at).getTime() <
                  60000
                : false;

              return (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className={`flex items-center gap-3 p-4 hover:bg-gray-700 border-b border-gray-700 transition-colors cursor-pointer ${
                    isNewMessage ? "bg-gray-750" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {conv.other_user?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    {conv.other_user?.is_online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-semibold truncate">
                        {conv.other_user?.username || "مستخدم"}
                      </h3>
                      {conv.last_message && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {new Date(
                              conv.last_message.created_at
                            ).toLocaleTimeString("ar", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isNewMessage && (
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm truncate ${
                          isNewMessage
                            ? "text-white font-semibold"
                            : "text-gray-400"
                        }`}
                      >
                        {conv.last_message?.content || "لا توجد رسائل"}
                      </p>
                      {isNewMessage && (
                        <span className="flex-shrink-0 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                          جديد
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <Link
            href="/users"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            محادثة جديدة
          </Link>
        </div>
      </div>

      {/* Main Content - المحادثة المختارة */}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
