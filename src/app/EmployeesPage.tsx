import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Users, Plus, X, Trash2, Clock, CheckCircle, UserPlus, DollarSign } from 'lucide-react';
import { getEmployees, saveEmployee, updateEmployee, deleteEmployee, getAttendance, saveAttendance, updateAttendance, Employee, AttendanceRecord } from './lib/orders';

export default function EmployeesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('laguna-auth') || '{}');
      if (auth.role !== 'employees' || Date.now() - auth.at > 14400000) {
        localStorage.removeItem('laguna-auth');
        navigate('/');
      }
    } catch { navigate('/'); }
  }, [navigate]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', role: '', salary: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [emps, att] = await Promise.all([getEmployees(), getAttendance()]);
      setEmployees(emps);
      setAttendance(att);
      setLoading(false);
    };
    fetch();
    const interval = setInterval(fetch, 15000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const todaysAttendance = (empId: string) => {
    return attendance.find(a => a.employeeId === empId && a.date === today);
  };

  const handleCheckIn = async (emp: Employee) => {
    await saveAttendance({ employeeId: emp.id, employeeName: emp.name, date: today, checkIn: Date.now(), checkOut: null });
    const [_, att] = await Promise.all([getEmployees(), getAttendance()]);
    setAttendance(att);
  };

  const handleCheckOut = async (record: AttendanceRecord) => {
    await updateAttendance(record.id, { checkOut: Date.now() });
    const att = await getAttendance();
    setAttendance(att);
  };

  const handleAddEmployee = async () => {
    if (!form.name.trim()) return;
    await saveEmployee({ ...form, salary: form.salary || 0, active: true, joinedAt: Date.now() });
    setEmployees(await getEmployees());
    setShowAdd(false);
    setForm({ name: '', phone: '', role: '', salary: 0 });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('حذف هذا الموظف؟')) return;
    await deleteEmployee(id);
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const totalSalaries = employees.filter(e => e.active).reduce((s, e) => s + e.salary, 0);

  const thisMonthDays = attendance.filter(a => a.date.startsWith(today.slice(0, 7)));
  const totalHours = thisMonthDays.reduce((s, a) => {
    if (a.checkOut) return s + (a.checkOut - a.checkIn) / 3600000;
    return s + (Date.now() - a.checkIn) / 3600000;
  }, 0);

  return (
    <div className="min-h-screen bg-[#f5f0eb]" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">رجوع</span>
          </button>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-600" />
            <h1 className="text-xl font-bold text-stone-800">الموظفين والحضور</h1>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors">
            <Plus className="h-3.5 w-3.5" />
            إضافة موظف
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <p className="text-xs text-stone-400 mb-1">الموظفين</p>
            <p className="text-2xl font-bold text-stone-800">{employees.filter(e => e.active).length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <p className="text-xs text-stone-400 mb-1">حضور اليوم</p>
            <p className="text-2xl font-bold text-emerald-600">{attendance.filter(a => a.date === today && !a.checkOut).length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <p className="text-xs text-stone-400 mb-1">ساعات الشهر</p>
            <p className="text-2xl font-bold text-amber-600">{Math.round(totalHours)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <p className="text-xs text-stone-400 mb-1">إجمالي المرتبات</p>
            <p className="text-2xl font-bold text-red-500">{totalSalaries.toLocaleString('ar-EG')} ج.م</p>
          </div>
        </div>

        {/* Employee List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden animate-pulse p-4">
                  <div className="h-5 bg-stone-200 rounded w-32 mb-2" />
                  <div className="h-4 bg-stone-200 rounded w-24" />
                </div>
              ))}
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-400 text-sm">لا يوجد موظفون</p>
            </div>
          ) : (
            employees.filter(e => e.active).map(emp => {
              const att = todaysAttendance(emp.id);
              return (
                <div key={emp.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between border-b border-stone-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-sm">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-800">{emp.name}</p>
                        <p className="text-xs text-stone-400">{emp.role} {emp.phone ? `• ${emp.phone}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-red-500">{emp.salary.toLocaleString('ar-EG')} <span className="text-xs text-red-300">ج.م</span></span>
                      <button onClick={() => handleDelete(emp.id)} className="p-1.5 text-stone-300 hover:text-red-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    {!att ? (
                      <button onClick={() => handleCheckIn(emp)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                        <Clock className="h-3.5 w-3.5" />
                        تسجيل حضور
                      </button>
                    ) : att.checkOut ? (
                      <span className="flex items-center gap-1.5 text-xs text-stone-400">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        انتهى: {new Date(att.checkOut).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <button onClick={() => handleCheckOut(att)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                        <Clock className="h-3.5 w-3.5" />
                        تسجيل انصراف
                      </button>
                    )}
                    <span className="text-xs text-stone-400">
                      {att && !att.checkOut
                        ? `${Math.round((Date.now() - att.checkIn) / 60000)} د`
                        : att?.checkOut
                        ? `${Math.round((att.checkOut - att.checkIn) / 60000)} د`
                        : '—'}
                    </span>
                  </div>
                  {/* Per-employee attendance history */}
                  <details className="border-t border-stone-50">
                    <summary className="px-4 py-2 text-xs text-stone-400 cursor-pointer hover:text-stone-600 hover:bg-stone-50 transition-colors">
                      أيام الحضور ({attendance.filter(a => a.employeeId === emp.id).length})
                    </summary>
                    <div className="px-4 pb-3 pt-1 max-h-48 overflow-y-auto space-y-1">
                      {attendance
                        .filter(a => a.employeeId === emp.id)
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map(a => (
                          <div key={a.id} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-50 last:border-0">
                            <span className="text-stone-600">{a.date}</span>
                            <span className="text-stone-400" dir="auto">
                              {new Date(a.checkIn).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                              {a.checkOut ? ` → ${new Date(a.checkOut).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}` : ' (جاري)'}
                              <span className="mr-2 text-stone-300">
                                {a.checkOut
                                  ? `${Math.round((a.checkOut - a.checkIn) / 3600000)}س`
                                  : `${Math.round((Date.now() - a.checkIn) / 3600000)}س`}
                              </span>
                            </span>
                          </div>
                        ))}
                    </div>
                  </details>
                </div>
              );
            })
          )}
        </div>

        {/* Inactive Employees */}
        {employees.filter(e => !e.active).length > 0 && (
          <details className="mt-6">
            <summary className="text-sm text-stone-400 cursor-pointer hover:text-stone-600">موظفون سابقون ({employees.filter(e => !e.active).length})</summary>
            <div className="mt-3 space-y-2">
              {employees.filter(e => !e.active).map(emp => (
                <div key={emp.id} className="bg-white rounded-xl shadow-sm border border-stone-100 px-4 py-2 flex items-center justify-between opacity-60">
                  <span className="text-sm text-stone-500">{emp.name}</span>
                  <button onClick={() => handleDelete(emp.id)} className="p-1 text-stone-300 hover:text-red-500">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Attendance History */}
        {attendance.length > 0 && (
          <details className="mt-6">
            <summary className="text-sm text-stone-400 cursor-pointer hover:text-stone-600">سجل الحضور ({attendance.length})</summary>
            <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
              {attendance.sort((a, b) => b.date.localeCompare(a.date) || (b.checkIn - a.checkIn)).map(a => (
                <div key={a.id} className="bg-white rounded-xl shadow-sm border border-stone-100 px-4 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-700">{a.employeeName}</p>
                    <p className="text-xs text-stone-400">{a.date}</p>
                  </div>
                  <div className="text-xs text-stone-400">
                    {new Date(a.checkIn).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    {a.checkOut ? ` → ${new Date(a.checkOut).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}` : ' (جاري)'}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAdd && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowAdd(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-stone-800">إضافة موظف</h2>
                <button onClick={() => setShowAdd(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="الاسم" className="w-full px-4 py-2.5 text-sm rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder:text-stone-400 outline-none focus:border-amber-400/60" />
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="رقم الهاتف" className="w-full px-4 py-2.5 text-sm rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder:text-stone-400 outline-none focus:border-amber-400/60" />
                <input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="الوظيفة" className="w-full px-4 py-2.5 text-sm rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder:text-stone-400 outline-none focus:border-amber-400/60" />
                <input value={form.salary || ''} onChange={e => setForm(p => ({ ...p, salary: Number(e.target.value) || 0 }))} type="number" placeholder="المرتب" className="w-full px-4 py-2.5 text-sm rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder:text-stone-400 outline-none focus:border-amber-400/60" />
              </div>
              <button onClick={handleAddEmployee} disabled={!form.name.trim()} className="w-full mt-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50">
                إضافة
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}