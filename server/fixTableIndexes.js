import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixTableIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const db = mongoose.connection.db;
    const collection = db.collection('tables');

    // Get current indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

    // Drop the incorrect tableNumber_1 index if it exists
    try {
      await collection.dropIndex('tableNumber_1');
      console.log('✅ Dropped incorrect tableNumber_1 index');
    } catch (error) {
      console.log('ℹ️ tableNumber_1 index not found or already dropped');
    }

    // Ensure the correct compound index exists
    await collection.createIndex(
      { cafeId: 1, tableNumber: 1 }, 
      { unique: true, name: 'cafeId_1_tableNumber_1' }
    );
    console.log('✅ Created correct compound index: { cafeId: 1, tableNumber: 1 }');

    // Verify final indexes
    const finalIndexes = await collection.indexes();
    console.log('Final indexes:', finalIndexes.map(idx => ({ name: idx.name, key: idx.key })));

    console.log('🎉 Index fix completed successfully!');
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
  } finally {
    await mongoose.disconnect();
  }
};

fixTableIndexes();