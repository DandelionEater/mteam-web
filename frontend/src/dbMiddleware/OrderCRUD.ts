const BASE_URL = "http://localhost:4000/api/orders";

export type OrderStatus = 
'created' | 
'packing' | 
'sent' | 
'completed' |
'pending_payment' |
'cancelled';

export interface OrderItem {
  manufacturingID: string;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  enteredEmail: string;
  delivery: boolean;
  address?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  email: string;
  delivery: boolean;
  address?: string;
  items: { manufacturingID: string; quantity: number }[];
  locale?: "en" | "lt";
}

export const createOrder = async (payload: CreateOrderPayload) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to create order");
  }
  return res.json();
};

export const fetchOrders = async (params?: {
  email?: string;
  from?: string;
  to?: string;
  status?: OrderStatus;
}): Promise<Order[]> => {
  const qs = new URLSearchParams();
  if (params?.email) qs.set("email", params.email);
  if (params?.from)  qs.set("from", params.from);
  if (params?.to)    qs.set("to", params.to);
  if (params?.status) qs.set("status", params.status);

  const url = qs.toString() ? `${BASE_URL}?${qs.toString()}` : BASE_URL;

  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to fetch orders");
  }
  return res.json();
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    credentials: 'include',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to update order");
  }
  return res.json();
};
