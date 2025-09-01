// server/utils/gstCalculator.js

/**
 * Calculate GST for an order based on cafe settings
 * @param {number} subtotal - Order subtotal before GST
 * @param {object} cafeSettings - Cafe GST settings
 * @returns {object} GST calculation details
 */
export const calculateGST = (subtotal, cafeSettings) => {
  if (!cafeSettings.hasGST || !cafeSettings.gstRates || cafeSettings.gstRates.length === 0) {
    return {
      totalGstAmount: 0,
      ratesApplied: [],
      gstNumber: cafeSettings.gstNumber || ''
    };
  }

  const ratesApplied = [];
  let totalGstAmount = 0;

  cafeSettings.gstRates.forEach(rate => {
    if (rate.percentage > 0) {
      const gstAmount = (subtotal * rate.percentage) / 100;
      totalGstAmount += gstAmount;
      
      ratesApplied.push({
        rateName: rate.rateName,
        percentage: rate.percentage,
        amount: parseFloat(gstAmount.toFixed(2))
      });
    }
  });

  return {
    totalGstAmount: parseFloat(totalGstAmount.toFixed(2)),
    ratesApplied,
    gstNumber: cafeSettings.gstNumber || ''
  };
};

/**
 * Calculate service charge
 * @param {number} subtotal - Order subtotal
 * @param {object} cafeSettings - Cafe service charge settings
 * @returns {number} Service charge amount
 */
export const calculateServiceCharge = (subtotal, cafeSettings) => {
  if (!cafeSettings.serviceCharge || cafeSettings.serviceCharge <= 0) {
    return 0;
  }

  if (cafeSettings.serviceChargeType === 'fixed') {
    return cafeSettings.serviceCharge;
  }

  // Percentage-based service charge
  return parseFloat(((subtotal * cafeSettings.serviceCharge) / 100).toFixed(2));
};

/**
 * Calculate complete order total with GST and service charge
 * @param {array} items - Order items
 * @param {object} cafeSettings - Cafe settings
 * @param {number} discount - Discount amount (optional)
 * @returns {object} Complete order calculation
 */
export const calculateOrderTotal = (items, cafeSettings, discount = 0) => {
  // Calculate subtotal
  const subtotal = items.reduce((total, item) => {
    return total + (item.itemPrice * item.quantity);
  }, 0);

  // Calculate GST
  const gstDetails = calculateGST(subtotal, cafeSettings);

  // Calculate service charge
  const serviceCharge = calculateServiceCharge(subtotal, cafeSettings);

  // Calculate final total
  const totalAmount = subtotal + gstDetails.totalGstAmount + serviceCharge - discount;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    gstDetails,
    serviceCharge,
    discount,
    totalAmount: parseFloat(totalAmount.toFixed(2))
  };
};