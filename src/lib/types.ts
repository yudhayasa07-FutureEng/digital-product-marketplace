export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

export interface Product {
  id: string;
  seller_id: string;
  seller_name: string;
  name: string;
  slug: string;
  description: string;
  price: number; // in IDR (Rp)
  category: string;
  thumbnail_url: string;
  file_url: string;
  file_name: string;
  file_size: string;
  preview_urls?: string[];
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  sales_count: number;
  rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_thumbnail: string;
  file_name: string;
  price: number;
}

export interface Order {
  id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_email: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  payment_method: string;
  items: OrderItem[];
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}
