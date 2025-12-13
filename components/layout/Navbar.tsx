import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">💬</span>
        </div>
        <span className="text-white font-bold text-2xl">ChatApp</span>
      </div>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-2 text-white hover:text-gray-200 transition-colors"
        >
          تسجيل الدخول
        </Link>
        <Link
          href="/signup"
          className="px-6 py-2 bg-white text-purple-900 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
        >
          إنشاء حساب
        </Link>
      </div>
    </nav>
  );
}
