import { useNavigate } from 'react-router';
import { Coffee, CookingPot, BarChart3 } from 'lucide-react';
import logoUrl from '@/assets/logo.png';

export default function StaffLogin() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'waiter',
      label: 'ويتر',
      desc: 'تسجيل الطلبات',
      icon: Coffee,
      gradient: 'from-amber-500 to-amber-600',
      shadow: 'shadow-amber-900/30',
      hover: 'hover:from-amber-400 hover:to-amber-500',
    },
    {
      id: 'barista',
      label: 'باريستا',
      desc: 'تحضير المشروبات',
      icon: CookingPot,
      gradient: 'from-stone-700 to-stone-800',
      shadow: 'shadow-stone-900/30',
      hover: 'hover:from-stone-600 hover:to-stone-700',
    },
    {
      id: 'reports',
      label: 'التقارير',
      desc: 'إحصائيات المبيعات',
      icon: BarChart3,
      gradient: 'from-emerald-600 to-emerald-700',
      shadow: 'shadow-emerald-900/30',
      hover: 'hover:from-emerald-500 hover:to-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2242] via-[#0d2d52] to-[#0A2242] flex flex-col items-center justify-center p-6 text-white" dir="rtl">
      {/* Background decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <img src={logoUrl} alt="Laguna Dubai" className="h-20 md:h-24 w-auto mx-auto mb-4 brightness-0 invert" />
          <h1 className="text-xl md:text-2xl font-bold tracking-[0.12em]" style={{ fontFamily: "'Playfair Display', serif" }}>LAGUNA DUBAI</h1>
          <p className="text-[10px] md:text-xs text-white/40 tracking-[0.25em] mt-1">STAFF PORTAL</p>
        </div>

        <p className="text-base md:text-lg text-white/70 mb-8">مرحباً بك، اختر وظيفتك</p>

        {/* Role Cards */}
        <div className="space-y-3 md:space-y-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => navigate(`/${role.id}`)}
                className={`w-full py-4 md:py-5 px-6 bg-gradient-to-l ${role.gradient} ${role.hover} text-white font-bold text-base md:text-lg rounded-2xl shadow-2xl ${role.shadow} transition-all duration-200 active:scale-[0.98] flex items-center gap-4`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-right flex-1">
                  <p className="font-bold">{role.label}</p>
                  <p className="text-xs text-white/60 font-normal">{role.desc}</p>
                </div>
                <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6"/></svg>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-white/20 mt-12">اختر وظيفتك للدخول إلى لوحة التحكم الخاصة بك</p>
      </div>
    </div>
  );
}
