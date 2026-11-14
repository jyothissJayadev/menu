// backend/seed.js
import mongoose from "mongoose";
import Company from "./models/Company.schema.js";
import Category from "./models/Category.schema.js";
import Item from "./models/Item.schema.js";
import Order from "./models/Order.schema.js";
import User from "./models/User.schema.js";
import bcrypt from "bcrypt";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/qr-menu-hub";

async function seed() {
  console.log("Connecting to MongoDB for seeding...", MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  // Clear existing collections
  await Company.deleteMany({});
  await Category.deleteMany({});
  await Item.deleteMany({});
  await Order.deleteMany({});
  await User.deleteMany({});

  console.log("Cleared old records.");

  // 1. Create Cake Shop Company
  const company = await Company.create({
    name: "Sweet Delights Cake Studio",
    location: "Main Street, Baker District",
    logo: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&auto=format&fit=crop&q=60",
    settings: {
      currency: "INR",
      timezone: "Asia/Kolkata",
    },
  });
  console.log("Created Company:", company.name, "(ID:", company._id, ")");

  // 2. Create Owner User
  const passwordHash = await bcrypt.hash("password123", 10);
  const owner = await User.create({
    name: "Master Baker",
    phone: "9876543210",
    password: passwordHash,
    companyId: company._id,
    role: "owner",
  });
  console.log("Created Owner User:", owner.name);

  // 3. Create Cake Categories
  const cat1 = await Category.create({
    companyId: company._id,
    name: "Birthday & Celebration",
    position: 1,
  });

  const cat2 = await Category.create({
    companyId: company._id,
    name: "Cheesecakes & Mousse",
    position: 2,
  });

  const cat3 = await Category.create({
    companyId: company._id,
    name: "Pastries & Tarts",
    position: 3,
  });

  const cat4 = await Category.create({
    companyId: company._id,
    name: "Cupcakes & Brownies",
    position: 4,
  });

  const cat5 = await Category.create({
    companyId: company._id,
    name: "Beverages & Shakes",
    position: 5,
  });

  console.log("Created 5 Cake Categories.");

  // 4. Create Cake Items
  const items = await Item.insertMany([
    {
      companyId: company._id,
      categoryId: cat1._id,
      name: "Belgian Truffle Chocolate Cake (1kg)",
      description: "Layered rich dark Belgian chocolate ganache with moist sponge cake.",
      price: 850,
      offer: true,
      offerPrice: 750,
      available: true,
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60",
    },
    {
      companyId: company._id,
      categoryId: cat1._id,
      name: "Red Velvet Cream Cheese Cake (500g)",
      description: "Classic crimson cocoa sponge topped with luxurious whipped Philadelphia cheese.",
      price: 550,
      offer: false,
      offerPrice: null,
      available: true,
      image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=500&auto=format&fit=crop&q=60",
    },
    {
      companyId: company._id,
      categoryId: cat2._id,
      name: "New York Baked Blueberry Cheesecake",
      description: "Rich velvety baked cream cheese base crowned with house-made wild blueberry compote.",
      price: 320,
      offer: true,
      offerPrice: 280,
      available: true,
      image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=60",
    },
    {
      companyId: company._id,
      categoryId: cat2._id,
      name: "Biscoff Lotus Mousse Cake",
      description: "Fluffy caramelized Lotus biscuit mousse infused with creamy white chocolate.",
      price: 340,
      offer: false,
      offerPrice: null,
      available: true,
      image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=500&auto=format&fit=crop&q=60",
    },
    {
      companyId: company._id,
      categoryId: cat3._id,
      name: "French Butter Croissant",
      description: "Golden, flaky, 27-layer laminated puff pastry baked with pure European churned butter.",
      price: 140,
      offer: false,
      offerPrice: null,
      available: true,
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60",
    },
    {
      companyId: company._id,
      categoryId: cat4._id,
      name: "Salted Caramel Hazelnut Cupcake (Pack of 2)",
      description: "Moist vanilla bean sponge filled with molten salted caramel & toasted hazelnuts.",
      price: 190,
      offer: true,
      offerPrice: 160,
      available: true,
      image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&auto=format&fit=crop&q=60",
    },
    {
      companyId: company._id,
      categoryId: cat5._id,
      name: "Iced Hazelnut Mocha Latte",
      description: "Double espresso pulled over Dutch dark chocolate, roasted hazelnut syrup & oat milk.",
      price: 210,
      offer: false,
      offerPrice: null,
      available: true,
      image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60",
    },
  ]);
  console.log(`Created ${items.length} Menu Items.`);

  // 5. Create Initial Seed Orders
  await Order.create([
    {
      companyId: company._id,
      orderNumber: 101,
      orderNo: "ORD-101",
      table: "Table 4",
      name: "Aarav Sharma",
      phone: "+91 98765 43210",
      notes: 'Please write "Happy 21st Birthday Sneha" in golden frosting on the cake.',
      status: "pending",
      total: 910,
      startTime: new Date(Date.now() - 15 * 60 * 1000),
      items: [
        {
          itemId: items[0]._id,
          name: items[0].name,
          qty: 1,
          price: 750,
          addons: [],
        },
        {
          itemId: items[5]._id,
          name: items[5].name,
          qty: 1,
          price: 160,
          addons: [],
        },
      ],
    },
    {
      companyId: company._id,
      orderNumber: 102,
      orderNo: "ORD-102",
      table: "Takeaway",
      name: "Priya Nambiar",
      phone: "+91 94471 22890",
      notes: "Pre-ordered yesterday for 7 PM pickup. Include wooden cutlery.",
      status: "cooking",
      total: 550,
      startTime: new Date(Date.now() - 35 * 60 * 1000),
      items: [
        {
          itemId: items[1]._id,
          name: items[1].name,
          qty: 1,
          price: 550,
          addons: [],
        },
      ],
    },
    {
      companyId: company._id,
      orderNumber: 103,
      orderNo: "ORD-103",
      table: "Table 2",
      name: "Rohan Verma",
      phone: "+91 98200 11234",
      notes: "Extra cold latte with less ice please.",
      status: "completed",
      total: 490,
      startTime: new Date(Date.now() - 60 * 60 * 1000),
      endTime: new Date(Date.now() - 25 * 60 * 1000),
      durationMinutes: 35,
      items: [
        {
          itemId: items[2]._id,
          name: items[2].name,
          qty: 1,
          price: 280,
          addons: [],
        },
        {
          itemId: items[6]._id,
          name: items[6].name,
          qty: 1,
          price: 210,
          addons: [],
        },
      ],
    },
  ]);
  console.log("Created Initial Orders (ORD-101, ORD-102, ORD-103).");

  console.log("🎉 Database Seed Completed Successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
