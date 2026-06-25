import { useNavigate } from 'react-router';
import logoUrl from '@/assets/logo.png';

export default function BaristaPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A2242] to-[#0d2d52] flex flex-col items-center justify-center p-6 text-white" dir="rtl">
      <div className="w-full max-w-sm mx-auto text-center">
        <img src={logoUrl} alt="Laguna Dubai" className="h-24 w-auto mx-auto mb-6 brightness-0 invert" />
        <h1 className="text-2xl font-bold tracking-[0.1em] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>LAGUNA DUBAI</h1>
        <p className="text-sm text-white/50 mb-10 tracking-[0.2em]">BARISTA PANEL</p>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <p className="text-lg text-white/60">قريباً</p>
          <p className="text-sm text-white/30 mt-2">لوحة تحكم الباريستا قيد التطوير</p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-8 text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          العودة للصفحة الرئيسية
        </button>
      </div>
    </div>
  );
}
