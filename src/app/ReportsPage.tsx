import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getOrders, clearAllOrders, saveDailyReport, getDailyReports, DailyReport, Order } from './lib/orders';
import { ArrowLeft, BarChart3, Coffee, DollarSign, ShoppingBag, TrendingUp, Trash2, Calendar } from 'lucide-react';
import logoUrl from '@/assets/logo.png';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedReports, setSavedReports] = useState<DailyReport[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [clearing, setClearing] = useState(false);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  useEffect(() => {
    const fetchData = async () => {
      const [all, reports] = await Promise.all([getOrders(), getDailyReports()]);
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      setOrders(all.filter(o => o.timestamp >= cutoff));
      setSavedReports(reports);
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClearToday = async () => {
    if (!window.confirm('هل تريد أرشفة بيانات اليوم ومسح الطلبات؟')) return;
    setClearing(true);
    try {
      const drinkMap = new Map<string, { quantity: number; revenue: number }>();
      for (const o of orders) {
        for (const item of o.items) {
          const existing = drinkMap.get(item.nameAr);
          if (existing) {
            existing.quantity += item.quantity;
            existing.revenue += item.price * item.quantity;
          } else {
            drinkMap.set(item.nameAr, { quantity: item.quantity, revenue: item.price * item.quantity });
          }
        }
      }
      const report: DailyReport = {
        date: todayStr,
        totalOrders: orders.length,
        totalItems: orders.reduce((s, o) => s + o.items.reduce((s2, i) => s2 + i.quantity, 0), 0),
        totalRevenue: orders.reduce((s, o) => s + o.totalPrice, 0),
        drinks: Array.from(drinkMap.entries()).map(([nameAr, val]) => ({ nameAr, ...val })),
      };
      await saveDailyReport(report);
      await clearAllOrders();
      setOrders([]);
      setSavedReports(prev => [report, ...prev.filter(r => r.date !== todayStr)]);
    } catch {
      alert('حدث خطأ');
    }
    setClearing(false);
  };

  const displayedReport = selectedDate === 'today'
    ? null
    : savedReports.find(r => r.date === selectedDate) ?? null;

  const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrders = orders.length;

  const drinksMap = new Map<string, { nameAr: string; quantity: number; revenue: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const existing = drinksMap.get(item.nameAr);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        drinksMap.set(item.nameAr, { nameAr: item.nameAr, quantity: item.quantity, revenue: item.price * item.quantity });
      }
    }
  }
  const drinks = Array.from(drinksMap.values()).sort((a, b) => b.quantity - a.quantity);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#f5f0eb]" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">رجوع</span>
          </button>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-600" />
            <h1 className="text-xl font-bold text-stone-800">التقارير</h1>
          </div>
          {selectedDate === 'today' && orders.length > 0 && (
            <button
              onClick={handleClearToday}
              disabled={clearing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {clearing ? 'جاري الأرشفة...' : 'أرشفة ومسح'}
            </button>
          )}
          {selectedDate !== 'today' && <div className="w-24" />}
        </div>

        {/* Day Selector */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedDate('today')}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedDate === 'today'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 inline ml-1" />
            اليوم
          </button>
          {savedReports.map(r => (
            <button
              key={r.date}
              onClick={() => setSelectedDate(r.date)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedDate === r.date
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              {formatDate(r.date)}
            </button>
          ))}
        </div>

        {selectedDate === 'today' ? (
          <>
            {/* Live Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-stone-400 font-medium">إجمالي الطلبات</span>
                  <ShoppingBag className="h-5 w-5 text-stone-300" />
                </div>
                <p className="text-3xl font-bold text-stone-800">{totalOrders}</p>
                <p className="text-xs text-stone-400 mt-1">آخر 24 ساعة</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-stone-400 font-medium">المشروبات المباعة</span>
                  <Coffee className="h-5 w-5 text-stone-300" />
                </div>
                <p className="text-3xl font-bold text-stone-800">{totalItems}</p>
                <p className="text-xs text-stone-400 mt-1">إجمالي القطع</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-stone-400 font-medium">الإيرادات</span>
                  <DollarSign className="h-5 w-5 text-stone-300" />
                </div>
                <p className="text-3xl font-bold text-amber-600">{totalRevenue.toLocaleString('ar-EG')} <span className="text-lg">ج.م</span></p>
                <p className="text-xs text-stone-400 mt-1">إجمالي المبيعات</p>
              </div>
            </div>

            {/* Live Drink Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-stone-800">تفصيل المشروبات</h2>
                </div>
                <span className="text-xs text-stone-400">{drinks.length} صنف</span>
              </div>

              {drinks.length === 0 ? (
                <div className="text-center py-12">
                  <Coffee className="h-10 w-10 text-stone-200 mx-auto mb-3" />
                  <p className="text-stone-400 text-sm">لا توجد طلبات اليوم</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-50">
                  {drinks.map((drink, idx) => (
                    <div key={drink.nameAr} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-stone-100 text-xs font-bold text-stone-500 flex items-center justify-center shrink-0">{idx + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-stone-800">{drink.nameAr}</p>
                          <p className="text-xs text-stone-400">{drink.quantity} قطعة</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-stone-800">{drink.revenue.toLocaleString('ar-EG')} ج.م</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : displayedReport ? (
          <>
            {/* Historical Stats */}
            <div className="mb-4">
              <p className="text-sm text-stone-400 font-medium">{formatDate(displayedReport.date)}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-stone-400 font-medium">إجمالي الطلبات</span>
                  <ShoppingBag className="h-5 w-5 text-stone-300" />
                </div>
                <p className="text-3xl font-bold text-stone-800">{displayedReport.totalOrders}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-stone-400 font-medium">المشروبات المباعة</span>
                  <Coffee className="h-5 w-5 text-stone-300" />
                </div>
                <p className="text-3xl font-bold text-stone-800">{displayedReport.totalItems}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-stone-400 font-medium">الإيرادات</span>
                  <DollarSign className="h-5 w-5 text-stone-300" />
                </div>
                <p className="text-3xl font-bold text-amber-600">{displayedReport.totalRevenue.toLocaleString('ar-EG')} <span className="text-lg">ج.م</span></p>
              </div>
            </div>

            {/* Historical Drink Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-stone-800">تفصيل المشروبات</h2>
                </div>
                <span className="text-xs text-stone-400">{displayedReport.drinks.length} صنف</span>
              </div>
              <div className="divide-y divide-stone-50">
                {displayedReport.drinks.sort((a, b) => b.quantity - a.quantity).map((drink, idx) => (
                  <div key={drink.nameAr} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-stone-100 text-xs font-bold text-stone-500 flex items-center justify-center shrink-0">{idx + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-stone-800">{drink.nameAr}</p>
                        <p className="text-xs text-stone-400">{drink.quantity} قطعة</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-stone-800">{drink.revenue.toLocaleString('ar-EG')} ج.م</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-400 text-sm">لا توجد تقارير لهذا اليوم</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <img src={logoUrl} alt="Laguna Dubai" className="h-8 w-auto mx-auto mb-2 opacity-30 brightness-0" />
          <p className="text-xs text-stone-300">LAGUNA DUBAI &bull; التقارير تُحدث تلقائياً كل 10 ثواني</p>
        </div>
      </div>
    </div>
  );
}
