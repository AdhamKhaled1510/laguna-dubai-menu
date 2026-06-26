export interface OrderItem {
  nameAr: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  totalPrice: number;
  timestamp: number;
  status: 'pending' | 'completed';
}

const DB_URL = 'https://laguna-dubai-default-rtdb.europe-west1.firebasedatabase.app/orders';
const NOTIF_URL = 'https://laguna-dubai-default-rtdb.europe-west1.firebasedatabase.app/notifications';
const REPORTS_URL = 'https://laguna-dubai-default-rtdb.europe-west1.firebasedatabase.app/dailyReports';

export interface DrinkSummary {
  nameAr: string;
  quantity: number;
  revenue: number;
}

export interface DailyReport {
  date: string;
  totalOrders: number;
  totalItems: number;
  totalRevenue: number;
  drinks: DrinkSummary[];
}

async function api(method: string, body?: unknown): Promise<any> {
  const res = await fetch(`${DB_URL}.json`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function apiId(id: string, method: string, body?: unknown): Promise<any> {
  const res = await fetch(`${DB_URL}/${id}.json`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function notifApi(method: string, body?: unknown): Promise<any> {
  const res = await fetch(`${NOTIF_URL}.json`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function notifApiId(id: string, method: string, body?: unknown): Promise<any> {
  const res = await fetch(`${NOTIF_URL}/${id}.json`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export async function getOrders(): Promise<Order[]> {
  const data = await api('GET');
  if (!data) return [];
  return Object.entries(data).map(([key, val]: [string, any]) => ({ ...val, id: key }));
}

export async function saveOrder(order: Omit<Order, 'id'>): Promise<void> {
  await api('POST', order);
}

export async function completeOrder(orderId: string): Promise<void> {
  await apiId(orderId, 'PATCH', { status: 'completed' });
}

export async function sendNotification(tableNumber: number): Promise<string> {
  const res = await notifApi('POST', {
    tableNumber,
    timestamp: Date.now(),
    read: false,
  });
  return res.name;
}

export interface Notification {
  id: string;
  tableNumber: number;
  timestamp: number;
  read: boolean;
}

export async function getNotifications(): Promise<Notification[]> {
  const data = await notifApi('GET');
  if (!data) return [];
  return Object.entries(data).map(([key, val]: [string, any]) => ({ ...val, id: key }));
}

export async function clearNotification(id: string): Promise<void> {
  await notifApiId(id, 'DELETE');
}

export async function clearAllOrders(): Promise<void> {
  await api('DELETE');
}

async function reportsApi(method: string, body?: unknown): Promise<any> {
  const res = await fetch(`${REPORTS_URL}.json`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function reportsApiId(id: string, method: string, body?: unknown): Promise<any> {
  const res = await fetch(`${REPORTS_URL}/${id}.json`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export async function saveDailyReport(report: DailyReport): Promise<void> {
  await reportsApiId(report.date, 'PUT', report);
}

export async function getDailyReports(): Promise<DailyReport[]> {
  const data = await reportsApi('GET');
  if (!data) return [];
  return Object.values(data).sort((a: DailyReport, b: DailyReport) => b.date.localeCompare(a.date));
}

export async function clearAllDailyReports(): Promise<void> {
  await reportsApi('DELETE');
}
