import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categoriesData = [
  { name: "Men's Apparel" },
  { name: "Women's Wear" },
  { name: 'Accessories' }
];

const menProducts = [
  {
    name: "Slim-Fit Denim Jacket",
    description: "Classic denim jacket crafted from raw selvedge cotton. Features classic button flaps and a modern slim silhouette.",
    price: 89.99,
    images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Classic Oxford Cotton Shirt",
    description: "Tailored from premium long-staple cotton, this classic button-down Oxford shirt features a button-down collar, structured chest pocket, and a clean fit.",
    price: 59.99,
    images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Slim-Fit Merino Crewneck",
    description: "Knitted from 100% fine-gauge Italian Merino wool, offering exceptional breathability, warmth, and ribbed collar detailing.",
    price: 79.50,
    images: ["https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Minimalist Linen Trousers",
    description: "Lightweight and highly breathable trousers crafted from pure organic flax linen, featuring an elasticated waistband and adjustable drawcord.",
    price: 89.00,
    images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Tailored Wool Blend Blazer",
    description: "An elegant unstructured blazer in a rich herringbone wool blend, featuring patch pockets and notched lapels.",
    price: 189.00,
    images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Raw Denim Selvedge Jeans",
    description: "Constructed from 14.5oz rigid Japanese selvedge denim. Designed to break in uniquely and form personalized fades.",
    price: 110.00,
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Premium Pima Cotton Tee",
    description: "Crafted from incredibly soft and durable Peruvian Pima cotton, engineered to withstand repeated washings.",
    price: 35.00,
    images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Modern Chino Shorts",
    description: "Cut from durable stretch-cotton twill, pre-washed for softness. Features a comfortable 7-inch inseam and slanted pockets.",
    price: 49.00,
    images: ["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Water-Resistant Trench Coat",
    description: "A functional, double-breasted trench coat built with water-resistant cotton gabardine. Features throat latch and storm flaps.",
    price: 249.00,
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Unstructured Lounge Hoodie",
    description: "Knitted from heavyweight loopback organic cotton fleece. Features drop-shoulder construction and a double-lined hood.",
    price: 85.00,
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80"],
  }
];

const womenProducts = [
  {
    name: "Silk Button-Down Blouse",
    description: "Made from exquisite 19mm mulberry silk, featuring a relaxed layout and covered button placket.",
    price: 120.00,
    images: ["https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "A-Line Linen Midi Dress",
    description: "An elegant, breezy midi dress crafted from wash-softened French linen, featuring a square neckline.",
    price: 110.00,
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "High-Waist Wide-Leg Crepe Trousers",
    description: "Tailored trousers in fluid, heavy-drape crepe fabric. Sit high on the waist with pressed creases.",
    price: 95.00,
    images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Structured Cotton Trench",
    description: "Double-breasted coat in dry, heavy cotton canvas. Classic design features epaulettes and check lining.",
    price: 260.00,
    images: ["https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Oversized Cashmere Knit",
    description: "An incredibly warm, chunky knit sweater crafted from pure cashmere with drop shoulders.",
    price: 240.00,
    images: ["https://images.unsplash.com/photo-1574164904299-3a102b110380?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Pleated Silk Wrap Skirt",
    description: "Constructed from shimmering silk charmeuse with sharp pleating throughout. Self-tie detailing.",
    price: 135.00,
    images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Ribbed Modal Bodysuit",
    description: "A fitted bodysuit knitted from ultra-soft modal fabric with comfortable stretch and snap closure.",
    price: 45.00,
    images: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Ethereal Chiffon Evening Gown",
    description: "An elegant wrap dress made from delicate floral-printed silk chiffon. Features flutter sleeves.",
    price: 295.00,
    images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Minimalist Ribbed Cardigan",
    description: "A long-line cardigan knitted in a dry cotton-merino blend ribbed stitch with no front fasteners.",
    price: 88.00,
    images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Satin Slip Midi Dress",
    description: "Timeless slip dress cut from glossy satin silk on the bias for a beautiful silhouette.",
    price: 125.00,
    images: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80"],
  }
];

const accessoriesProducts = [
  {
    name: "Grained Leather Tote Bag",
    description: "Meticulously handcrafted in Italy from premium grained calfskin. Features a spacious raw-suede lined interior.",
    price: 350.00,
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Classic Acetate Sunglasses",
    description: "Timeless D-frame sunglasses hand-polished from cellulose acetate. Polarized UV400 lenses.",
    price: 145.00,
    images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Minimalist Brass Cuff",
    description: "A sleek, hand-formed solid brass wrist cuff with a satin brushed finish, designed to develop a natural patina.",
    price: 65.00,
    images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Vegetable-Tanned Leather Belt",
    description: "Constructed from 4mm thick full-grain vegetable-tanned harness leather with solid brass buckle.",
    price: 75.00,
    images: ["https://images.unsplash.com/photo-1624222247344-550fb8ecf60d?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Organic Cotton Ribbed Beanie",
    description: "A soft, double-layer fisherman beanie knitted from 100% organic cotton yarn. Features adjustable fold.",
    price: 28.00,
    images: ["https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Hand-Woven Silk Scarf",
    description: "Luxurious, lightweight scarf hand-woven from fine silk, featuring micro-fringing details.",
    price: 95.00,
    images: ["https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Minimal Leather Cardholder",
    description: "Ultra-slim card wallet made from premium Horween leather, featuring four card slots.",
    price: 45.00,
    images: ["https://images.unsplash.com/photo-1627124118123-e4d3db73929f?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Wool Felt Fedora Hat",
    description: "An elegant wide-brim fedora blocked from premium 100% wool felt. Accented with a slim leather band.",
    price: 125.00,
    images: ["https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Stainless Steel Chronograph Watch",
    description: "A modern watch featuring a 40mm brushed stainless steel casing, Japanese quartz movement.",
    price: 245.00,
    images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Knitted Cashmere Gloves",
    description: "Warm, insulating gloves knitted in a classic rib stitch from 100% Grade-A cashmere.",
    price: 68.00,
    images: ["https://images.unsplash.com/photo-1543330091-27228394c7dc?w=800&auto=format&fit=crop&q=80"],
  }
];

// Helper to generate a random stock number between 10 and 50
const getRandomStock = () => Math.floor(Math.random() * (50 - 10 + 1)) + 10;

async function main() {
  console.log('Clearing database catalog data...');
  // Remove existing transaction/dependent data first
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding default users...');
  
  // Pre-hash passwords
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHashed = await bcrypt.hash('adminpassword', salt);
  const userPasswordHashed = await bcrypt.hash('userpassword', salt);

  // Create default admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'AURA Admin',
      email: 'admin@aura.com',
      password: adminPasswordHashed,
      role: 'ADMIN'
    }
  });
  console.log(`Admin user created: ${adminUser.email}`);

  // Create default customer user
  const customerUser = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'user@aura.com',
      password: userPasswordHashed,
      role: 'USER'
    }
  });
  console.log(`Customer user created: ${customerUser.email}`);

  console.log("Seeding categories...");
  const categories = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: cat
    });
    categories[cat.name] = createdCat.id;
  }
  console.log('Categories created successfully!');

  console.log("Seeding products for Men's Apparel...");
  for (const p of menProducts) {
    await prisma.product.create({
      data: {
        ...p,
        stock: getRandomStock(),
        sizes: ['S', 'M', 'L', 'XL'],
        categoryId: categories["Men's Apparel"]
      }
    });
  }

  console.log("Seeding products for Women's Wear...");
  for (const p of womenProducts) {
    await prisma.product.create({
      data: {
        ...p,
        stock: getRandomStock(),
        sizes: ['S', 'M', 'L', 'XL'],
        categoryId: categories["Women's Wear"]
      }
    });
  }

  console.log('Seeding products for Accessories...');
  for (const p of accessoriesProducts) {
    await prisma.product.create({
      data: {
        ...p,
        stock: getRandomStock(),
        sizes: ['One Size'],
        categoryId: categories['Accessories']
      }
    });
  }

  console.log('Database seeded successfully! 🌱');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
