import { env } from "./util/config";
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { UserModel } from './model/User.schema';
import { Gallery, GalleryModel } from "./model/Item.schema";

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

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
