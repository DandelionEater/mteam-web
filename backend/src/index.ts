import { env } from "./util/config";
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { UserModel } from './model/User.schema';
import { Gallery, GalleryModel, Item, ItemModel } from "./model/Item.schema";
import { Category, CategoryModel } from "./model/Category.schema";
import { OrderModel, OrderStatus } from "./model/Order.schema";
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, ACCESS_TOKEN_TTL, COOKIE_OPTIONS } from './config';
import { requireAuth } from './middleware/requireAuth';
import { AuthedRequest } from "./types/AuthedRequest";
import { sendOrderCreatedEmails, sendOrderStatusEmails } from './services/emailService';
import 'dotenv/config';
import { loadEnv } from "./config/env";
import path from "path";
import payseraRoutes from "./api/payments/paysera";
import mockRoutes from "./api/payments/mock";

loadEnv();
console.log(
  `[mail] transport=${process.env.EMAIL_TRANSPORT} host=${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`
);

const app = express();
const PORT = 4000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mteam')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({ 
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Cookies
app.use(cookieParser());

// Email assets
app.use("/email-assets", express.static(path.join(__dirname, "../public")));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/payments/paysera", payseraRoutes);
app.use("/api/payments/mock", mockRoutes);

// Login route
app.post('/api/login', async (req: Request, res: Response): Promise<void> => {
  console.log('Login request body:', req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: new RegExp(`^${normalizedEmail}$`, 'i') });

    if (!user) {
      res.status(401).json({ message: 'Invalid email (or password)' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ message: 'Invalid (email) or password' });
      return;
    }

    const payload = { sub: user.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

    res.cookie('access_token', token, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 1000 }); // 1 h
    res.json({ message: 'Login successful' });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout route
app.post('/api/logout', (_req, res) => {
  res.clearCookie('access_token', COOKIE_OPTIONS);
  res.json({ message: 'Logged out successfully' });
});

// Item CRUD
// Add
app.post('/api/item', requireAuth, async (req: AuthedRequest, res: Response): Promise<void> => {
  console.log('Item added successfully:', req.body);
  const { name, description, manufacturingID, category, stock, price, images} : Item = req.body;

  if (!name  || !manufacturingID || !category || !stock || !price || !images) {
    res.status(400).json({ message: "Name, manufacturing ID, category, stock, price and images can't be null" });
    return;
  }

  if (!name.en?.trim() || !name.lt?.trim()) {
    res.status(400).json({ message: "Both name translations are required" });
    return;
  }

  const result = await ItemModel.create({name, description, manufacturingID, category, stock, price, images});

  res.status(201).json({ message: "Item added succesfully", entry: result });
});

// Get
app.get('/api/item', async (req: Request, res: Response): Promise<void> => {
  const result = await ItemModel.find().populate('category').lean();

  res.json(result);
});

// Get by ID
app.get('/api/item/:id', async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  try {
    const item = await ItemModel.findById(id).lean();
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch item" });
  }
});

// Put
app.put('/api/item/:id', requireAuth, async (req: AuthedRequest, res: Response): Promise<void> =>{
  const id = req.params.id;

  const entry = await ItemModel.findById(id);

  if(!entry) {
    res.status(404).json({ message: "Item not found" });
    return;
  }

  const { name, description, manufacturingID, category, stock, price, images} : Item = req.body;
  entry.name = name;
  entry.description = description;
  entry.manufacturingID = manufacturingID;
  entry.category = category;
  entry.stock = stock;
  entry.price = price;
  entry.images = images;
  const result = await entry.save();

  res.json(result);
});

// Delete
app.delete('/api/item/:id', requireAuth, async (req: AuthedRequest, res: Response): Promise<void> =>{
  const id = req.params.id;

  const entry = await ItemModel.findByIdAndDelete(id);

  if(!entry) {
    res.status(404).json({ message: "Item not found" });
    return;
  }
  res.json({ message: "Item deleted successfully" });
});

// Gallery CRUD
// Add
app.post('/api/gallery', requireAuth, async (req: AuthedRequest, res: Response): Promise<void> => {
  console.log('Gallery item added successfully:', req.body);
  const { name, description, images} : Gallery = req.body;

  if (!name || !images) {
    res.status(400).json({ message: "Name and images can't be null" });
    return;
  }

  const result = await GalleryModel.create({name, description, images});

  res.status(201).json({ message: "Gallery item added succesfully", entry: result });
});

// Get
app.get('/api/gallery', async (req: Request, res: Response): Promise<void> => {
  const result = await GalleryModel.find().lean();

  res.json(result);
});

// Get by ID
app.get('/api/gallery/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const entry = await GalleryModel.findById(id).lean();
    if (!entry) {
      res.status(404).json({ message: 'Gallery item not found' });
      return;
    }
    res.json(entry);
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Put
app.put('/api/gallery/:id', requireAuth, async (req: AuthedRequest, res: Response): Promise<void> =>{
  const id = req.params.id;

  const entry = await GalleryModel.findById(id);

  if(!entry) {
    res.status(404).json({ message: "Item not found" });
    return;
  }

  const { name, description, images} : Gallery = req.body;
  entry.name = name;
  entry.description = description;
  entry.images = images;
  const result = await entry.save();

  res.json(result);
});

// Delete
app.delete('/api/gallery/:id', requireAuth, async (req: AuthedRequest, res: Response): Promise<void> =>{
  const id = req.params.id;

  const entry = await GalleryModel.findByIdAndDelete(id);

  if(!entry) {
    res.status(404).json({ message: "Item not found" });
    return;
  }
  res.json({ message: "Item deleted successfully" });
});

// Category CRUD
// Add
app.post('/api/categories', requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || (!name.en && !name.lt)) {
      res.status(400).json({ message: "Name must have at least one language entry" });
      return;
    }

    const result = await CategoryModel.create({ name });

    res.status(201).json({ message: "Category added successfully", entry: result });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const result = await CategoryModel.find().lean();
    res.json(result);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Put
app.put('/api/categories/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { name } = req.body;

    if (!name || (!name.en && !name.lt)) {
      res.status(400).json({ message: "Name must have at least one language entry" });
      return;
    }

    const entry = await CategoryModel.findById(id);
    if (!entry) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    entry.name = name;
    const result = await entry.save();

    res.json(result);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete
app.delete('/api/categories/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const id = req.params.id;
    const entry = await CategoryModel.findByIdAndDelete(id);

    if (!entry) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Orders CRUD
// Add
app.post('/api/orders', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, delivery, address, items, locale } = req.body as {
      email?: string;
      delivery?: boolean;
      address?: string;
      items?: Array<{ manufacturingID: string; quantity: number }>;
      locale?: "en" | "lt";
    };

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400).json({ message: 'Valid email is required' });
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Items are required' });
      return;
    }
    if (delivery && !address) {
      res.status(400).json({ message: 'Address is required when delivery=true' });
      return;
    }

    const ids = items.map(i => i.manufacturingID);
    const dbItems = await ItemModel.find({ manufacturingID: { $in: ids } })
      .select({ manufacturingID: 1, price: 1 })
      .lean();

    const priceById = new Map(dbItems.map(d => [d.manufacturingID, d.price as number]));
    let total = 0;
    for (const it of items) {
      const price = priceById.get(it.manufacturingID);
      if (price == null) {
        res.status(400).json({ message: `Unknown item: ${it.manufacturingID}` });
        return;
      }
      const qty = Number(it.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        res.status(400).json({ message: `Invalid quantity for ${it.manufacturingID}` });
        return;
      }
      total += price * qty;
    }

    const created = await OrderModel.create({
      enteredEmail: email,
      delivery: !!delivery,
      address: delivery ? address : undefined,
      items,
      total,
      locale: locale === "lt" ? "lt" : "en",
      status: OrderStatus.PendingPayment,
    });

    res.status(201).json(created);
    //sendOrderCreatedEmails(created as any).catch(() => {});
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Get all
app.get('/api/orders', requireAuth, async (req: AuthedRequest, res: Response): Promise<void> => {
  try {
    const { email, from, to, status } = req.query as {
      email?: string;
      from?: string;
      to?: string;
      status?: string;
    };

    const filter: any = {};

    if (email && email.trim()) {
      filter.enteredEmail = { $regex: email.trim(), $options: 'i' };
    }

    if (status && status.trim()) {
      filter.status = status.trim().toLowerCase();
    }

    const createdAt: any = {};
    const parseDateStart = (v: string) => {
      if (/^\d{4}-\d{2}$/.test(v)) return new Date(v + "-01T00:00:00.000Z");
      return new Date(v);
    };
    const parseDateEndExclusive = (v: string) => {
      if (/^\d{4}-\d{2}$/.test(v)) {
        const [y, m] = v.split("-").map(Number);
        const nextMonth = m === 12 ? 1 : m + 1;
        const nextYear = m === 12 ? y + 1 : y;
        return new Date(`${nextYear}-${String(nextMonth).padStart(2,'0')}-01T00:00:00.000Z`);
      } else {
        const d = new Date(v);
        d.setUTCDate(d.getUTCDate() + 1);
        d.setUTCHours(0,0,0,0);
        return d;
      }
    };

    if (from) createdAt.$gte = parseDateStart(from);
    if (to)   createdAt.$lt  = parseDateEndExclusive(to);
    if (Object.keys(createdAt).length) filter.createdAt = createdAt;

    const orders = await OrderModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    console.error('Error listing orders:', err);
    res.status(500).json({ message: 'Failed to list orders' });
  }
});

// Get by ID
app.get('/api/orders/:id', requireAuth, async (req: AuthedRequest, res: Response): Promise<void> => {
  try {
    const order = await OrderModel.findById(req.params.id).lean();
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// Update
app.patch('/api/orders/:id', requireAuth, async (req: AuthedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body as { status?: string };

    if (status && !Object.values(OrderStatus).includes(status as OrderStatus)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const updated = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { $set: { ...(status ? { status } : {}) } },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    sendOrderStatusEmails(updated as any).catch(() => {});

    res.json(updated);
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ message: 'Failed to update order' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
