// server/jobs/subscriptionCron.js
import cron from 'node-cron';
import Cafe from '../models/Cafe.js';

/**
 * Cron job to check and update expired subscriptions
 * Runs every hour
 */
export const startSubscriptionCron = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🔄 Running subscription expiry check...');
      
      const now = new Date();
      
      // Find cafes with expired subscriptions that are still active
      const expiredCafes = await Cafe.find({
        $or: [
          {
            'subscription.status': 'active',
            'subscription.endDate': { $lte: now }
          },
          {
            'subscription.status': 'trial',
            'subscription.trialEndDate': { $lte: now }
          }
        ]
      });

      if (expiredCafes.length > 0) {
        console.log(`📋 Found ${expiredCafes.length} expired subscriptions`);
        
        // Update all expired cafes to inactive
        const updateResult = await Cafe.updateMany(
          {
            _id: { $in: expiredCafes.map(cafe => cafe._id) }
          },
          {
            $set: {
              'subscription.status': 'inactive',
              'status': 'inactive'
            }
          }
        );

        console.log(`✅ Updated ${updateResult.modifiedCount} cafes to inactive status`);
        
        // Log expired cafes for monitoring
        expiredCafes.forEach(cafe => {
          console.log(`🚫 Expired: ${cafe.name} (${cafe.email}) - End Date: ${cafe.subscription.endDate || cafe.subscription.trialEndDate}`);
        });
      } else {
        console.log('✅ No expired subscriptions found');
      }
    } catch (error) {
      console.error('❌ Subscription cron job error:', error);
    }
  });

  console.log('🚀 Subscription expiry cron job started (runs every hour)');
};

/**
 * Manual function to check and update expired subscriptions
 * Can be called from admin panel or API
 */
export const checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    
    const expiredCafes = await Cafe.find({
      $or: [
        {
          'subscription.status': 'active',
          'subscription.endDate': { $lte: now }
        },
        {
          'subscription.status': 'trial',
          'subscription.trialEndDate': { $lte: now }
        }
      ]
    });

    if (expiredCafes.length > 0) {
      await Cafe.updateMany(
        {
          _id: { $in: expiredCafes.map(cafe => cafe._id) }
        },
        {
          $set: {
            'subscription.status': 'inactive',
            'status': 'inactive'
          }
        }
      );
    }

    return {
      success: true,
      expiredCount: expiredCafes.length,
      expiredCafes: expiredCafes.map(cafe => ({
        id: cafe._id,
        name: cafe.name,
        email: cafe.email,
        endDate: cafe.subscription.endDate || cafe.subscription.trialEndDate
      }))
    };
  } catch (error) {
    console.error('Manual subscription check error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};