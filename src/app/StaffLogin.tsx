import { useNavigate } from 'react-router';
import logoUrl from '@/assets/logo.png';

export default function StaffLogin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A2242] to-[#0d2d52] flex flex-col items-center justify-center p-6 text-white" dir="rtl">
      <div className="w-full max-w-sm mx-auto text-center">
        <img src={logoUrl} alt="Laguna Dubai" className="h-24 w-auto mx-auto mb-6 brightness-0 invert" />
        <h1 className="text-2xl font-bold tracking-[0.1em] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>LAGUNA DUBAI</h1>
        <p className="text-sm text-white/50 mb-10 tracking-[0.2em]">STAFF WEBSITE</p>

        <p className="text-lg text-white/80 mb-8">مرحباً بك، اختر وظيفتك</p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/waiter')}
            className="w-full py-4 px-6 bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 font-bold text-lg rounded-xl shadow-2xl shadow-amber-900/30 transition-all duration-200 active:scale-[0.98]"
          >
            ويتر
          </button>

          <button
            onClick={() => navigate('/barista')}
            className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-xl border border-white/20 transition-all duration-200 active:scale-[0.98] backdrop-blur-sm"
          >
            باريستا
          </button>
        </div>

        <p className="text-xs text-white/30 mt-10">اختر وظيفتك للدخول إلى لوحة التحكم الخاصة بك</p>
      </div>
    </div>
  );
}
