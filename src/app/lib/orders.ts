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
