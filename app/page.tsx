import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <Navbar />

      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-block mb-6">
            <span className="bg-purple-500/20 text-purple-200 px-4 py-2 rounded-full text-sm font-medium border border-purple-400/30">
              ⚡ محادثات فورية بدون تأخير
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            تواصل مع العالم
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              في لحظات
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            منصة محادثات حديثة وسريعة. تبادل الرسائل والملفات والصور مع أصدقائك في الوقت الفعلي.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 w-full sm:w-auto"
            >
              ابدأ مجاناً الآن 🚀
            </Link>
            <Link 
              href="/login"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-lg border-2 border-white/20 hover:bg-white/20 transition-all w-full sm:w-auto"
            >
              لدي حساب بالفعل
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">⚡</div>
              <div className="text-2xl font-bold text-white">فوري</div>
              <div className="text-gray-400 text-sm">رسائل لحظية</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">🔒</div>
              <div className="text-2xl font-bold text-white">آمن</div>
              <div className="text-gray-400 text-sm">تشفير كامل</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">🌐</div>
              <div className="text-2xl font-bold text-white">عالمي</div>
              <div className="text-gray-400 text-sm">متاح في كل مكان</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              محادثات فورية
            </h3>
            <p className="text-gray-300 leading-relaxed">
              أرسل واستقبل الرسائل في نفس اللحظة. لا تأخير، لا انتظار.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-3xl">📁</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              مشاركة الملفات
            </h3>
            <p className="text-gray-300 leading-relaxed">
              شارك الصور والملفات والمستندات بكل سهولة وأمان.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mb-6">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              محادثات جماعية
            </h3>
            <p className="text-gray-300 leading-relaxed">
              أنشئ مجموعات وتحدث مع أصدقائك جميعاً في مكان واحد.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-white/10">
        <div className="text-center text-gray-400">
          <p>© 2024 ChatApp. جميع الحقوق محفوظة.</p>
          <p className="text-sm mt-2">مبني بـ ❤️ باستخدام Next.js و Supabase</p>
        </div>
      </footer>
    </div>
  )
}