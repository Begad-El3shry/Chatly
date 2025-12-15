'use client'

export default function ChatDefaultPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-gray-500">
      <svg className="w-32 h-32 mb-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <h2 className="text-2xl font-bold text-gray-400 mb-2">
        اختر محادثة لبدء المحادثة
      </h2>
      <p className="text-gray-500 mb-6">
        أو ابدأ محادثة جديدة من قائمة المستخدمين
      </p>
    </div>
  )
}
