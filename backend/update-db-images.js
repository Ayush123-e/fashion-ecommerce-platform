import prisma from './lib/db.js';

async function updateImages() {
  console.log('Starting image URL updates in the database...');

  // Update Vegetable-Tanned Leather Belt
  const belt = await prisma.product.updateMany({
    where: { name: 'Vegetable-Tanned Leather Belt' },
    data: {
      images: ['https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=80']
    }
  });
  console.log(`Updated Vegetable-Tanned Leather Belt: matched/updated ${belt.count} products.`);

  // Update Minimal Leather Cardholder
  const cardholder = await prisma.product.updateMany({
    where: { name: 'Minimal Leather Cardholder' },
    data: {
      images: ['https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=800&auto=format&fit=crop&q=80']
    }
  });
  console.log(`Updated Minimal Leather Cardholder: matched/updated ${cardholder.count} products.`);

  console.log('Database image URL updates completed successfully! 🚀');
}

updateImages()
  .catch((err) => {
    console.error('Error updating database image URLs:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
