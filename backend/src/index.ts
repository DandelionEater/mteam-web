import { env } from "./util/config";
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { UserModel } from './model/User.schema';
import { Gallery, GalleryModel, Item, ItemModel } from "./model/Item.schema";
import { Category, CategoryModel } from "./model/Category.schema";

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
    console.log('User found:', user);

    if (!user) {
      res.status(401).json({ message: 'Invalid email (or password)' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ message: 'Invalid (email) or password' });
      return;
    }

    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Item CRUD
// Add
app.post('/api/item', async (req: Request, res: Response): Promise<void> => {
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
app.put('/api/item/:id', async (req: Request, res: Response): Promise<void> =>{
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
app.delete('/api/item/:id', async (req: Request, res: Response): Promise<void> =>{
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
app.post('/api/gallery', async (req: Request, res: Response): Promise<void> => {
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
app.put('/api/gallery/:id', async (req: Request, res: Response): Promise<void> =>{
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
app.delete('/api/gallery/:id', async (req: Request, res: Response): Promise<void> =>{
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
app.post('/api/categories', async (req: Request, res: Response) => {
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
app.put('/api/categories/:id', async (req: Request, res: Response) => {
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
app.delete('/api/categories/:id', async (req: Request, res: Response) => {
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

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
