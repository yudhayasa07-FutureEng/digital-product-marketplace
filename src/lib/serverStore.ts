import fs from 'fs';
import path from 'path';
import os from 'os';
import { Product, Order, User, Review, Category } from './types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_REVIEWS } from './mockData';

export interface DatabaseSchema {
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  reviews: Review[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');
const TMP_FILE = path.join(os.tmpdir(), 'digitalhub_db.json');

let memoryDb: DatabaseSchema | null = null;

function getInitialDb(): DatabaseSchema {
  return {
    users: [],
    categories: INITIAL_CATEGORIES,
    products: INITIAL_PRODUCTS,
    orders: [],
    reviews: INITIAL_REVIEWS,
  };
}

function ensureDb(): DatabaseSchema {
  if (memoryDb) {
    return memoryDb;
  }

  // 1. Try reading from /tmp if previously modified in serverless
  try {
    if (fs.existsSync(TMP_FILE)) {
      const rawTmp = fs.readFileSync(TMP_FILE, 'utf-8');
      memoryDb = JSON.parse(rawTmp) as DatabaseSchema;
      return memoryDb;
    }
  } catch {
    // Ignore /tmp read error
  }

  // 2. Try reading from project data/db.json
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = JSON.parse(raw) as DatabaseSchema;
      return memoryDb;
    }
  } catch {
    // Ignore error
  }

  // 3. Fallback to initial DB
  memoryDb = getInitialDb();

  // Try persisting locally if writable
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem (e.g. Vercel), try saving to /tmp
    try {
      fs.writeFileSync(TMP_FILE, JSON.stringify(memoryDb, null, 2), 'utf-8');
    } catch {
      // In-memory only
    }
  }

  return memoryDb;
}

function saveDb(data: DatabaseSchema) {
  memoryDb = data;

  // Try writing to project data folder (local dev)
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem (Vercel)
  }

  // Always try writing to /tmp in serverless
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // In-memory fallback
  }
}

export const serverDb = {
  get: ensureDb,
  save: saveDb,

  // Products
  getProducts: (filters?: { category?: string; query?: string; sort?: string; sellerId?: string }) => {
    const db = ensureDb();
    let result = [...db.products];

    if (filters?.sellerId) {
      result = result.filter(p => p.seller_id === filters.sellerId);
    }

    if (filters?.category && filters.category !== 'all') {
      result = result.filter(p => p.category === filters.category);
    }

    if (filters?.query) {
      const q = filters.query.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.seller_name.toLowerCase().includes(q)
      );
    }

    if (filters?.sort) {
      switch (filters.sort) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'popular':
          result.sort((a, b) => b.sales_count - a.sales_count);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
        default:
          result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
      }
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  },

  getProductById: (id: string) => {
    const db = ensureDb();
    return db.products.find(p => p.id === id || p.slug === id);
  },

  createProduct: (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'sales_count' | 'rating' | 'rating_count'>) => {
    const db = ensureDb();
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
      sales_count: 0,
      rating: 5.0,
      rating_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.products.unshift(newProduct);
    saveDb(db);
    return newProduct;
  },

  updateProduct: (id: string, updates: Partial<Product>) => {
    const db = ensureDb();
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    db.products[index] = {
      ...db.products[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveDb(db);
    return db.products[index];
  },

  deleteProduct: (id: string) => {
    const db = ensureDb();
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    db.products.splice(index, 1);
    saveDb(db);
    return true;
  },

  // Orders
  getOrders: (buyerId?: string) => {
    const db = ensureDb();
    if (buyerId) {
      return db.orders.filter(o => o.buyer_id === buyerId);
    }
    return db.orders;
  },

  createOrder: (orderData: {
    buyer_id: string;
    buyer_name: string;
    buyer_email: string;
    payment_method: string;
    items: { product_id: string }[];
  }) => {
    const db = ensureDb();
    const orderItems = orderData.items.map((item, idx) => {
      const prod = db.products.find(p => p.id === item.product_id);
      if (!prod) throw new Error(`Product ${item.product_id} not found`);
      // Increment sales count
      prod.sales_count = (prod.sales_count || 0) + 1;
      return {
        id: `item-${Date.now()}-${idx}`,
        order_id: '',
        product_id: prod.id,
        product_name: prod.name,
        product_thumbnail: prod.thumbnail_url,
        file_name: prod.file_name,
        price: prod.price,
      };
    });

    const totalAmount = orderItems.reduce((acc, cur) => acc + cur.price, 0);
    const orderId = 'ord-' + Date.now();

    const newOrder: Order = {
      id: orderId,
      buyer_id: orderData.buyer_id,
      buyer_name: orderData.buyer_name,
      buyer_email: orderData.buyer_email,
      total_amount: totalAmount,
      status: 'completed',
      payment_method: orderData.payment_method,
      items: orderItems.map(item => ({ ...item, order_id: orderId })),
      created_at: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    saveDb(db);
    return newOrder;
  },

  // Check if buyer has purchased product
  hasPurchased: (buyerId: string, productId: string) => {
    const db = ensureDb();
    return db.orders.some(o =>
      o.buyer_id === buyerId &&
      o.status === 'completed' &&
      o.items.some(item => item.product_id === productId)
    );
  },

  // Users
  getUserByEmail: (email: string) => {
    const db = ensureDb();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserById: (id: string) => {
    const db = ensureDb();
    return db.users.find(u => u.id === id);
  },

  createUser: (userData: { name: string; email: string; role: 'buyer' | 'seller'; avatar?: string }) => {
    const db = ensureDb();
    const newUser: User = {
      id: 'user-' + Date.now(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`,
      created_at: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveDb(db);
    return newUser;
  },

  updateUserRole: (id: string, role: 'buyer' | 'seller' | 'admin') => {
    const db = ensureDb();
    const user = db.users.find(u => u.id === id);
    if (!user) return null;
    user.role = role;
    saveDb(db);
    return user;
  },

  // Categories
  getCategories: () => {
    const db = ensureDb();
    return db.categories;
  },

  // Reviews
  getProductReviews: (productId: string) => {
    const db = ensureDb();
    return db.reviews.filter(r => r.product_id === productId);
  },

  addReview: (review: { product_id: string; user_id: string; user_name: string; rating: number; comment: string }) => {
    const db = ensureDb();
    const newReview: Review = {
      id: 'rev-' + Date.now(),
      ...review,
      created_at: new Date().toISOString(),
    };
    db.reviews.unshift(newReview);

    // update product rating average
    const reviews = db.reviews.filter(r => r.product_id === review.product_id);
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const prod = db.products.find(p => p.id === review.product_id);
    if (prod) {
      prod.rating = parseFloat(avg.toFixed(1));
      prod.rating_count = reviews.length;
    }

    saveDb(db);
    return newReview;
  }
};
