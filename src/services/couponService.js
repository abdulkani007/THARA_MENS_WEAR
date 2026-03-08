import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const couponService = {
  async createCoupon(couponData) {
    const docRef = await addDoc(collection(db, 'coupons'), {
      ...couponData,
      usedCount: 0,
      createdAt: new Date()
    });
    return docRef.id;
  },

  async updateCoupon(couponId, couponData) {
    await updateDoc(doc(db, 'coupons', couponId), couponData);
  },

  async deleteCoupon(couponId) {
    await deleteDoc(doc(db, 'coupons', couponId));
  },

  async getCouponByCode(code) {
    const q = query(collection(db, 'coupons'), where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  },

  async getAllCoupons() {
    const snapshot = await getDocs(collection(db, 'coupons'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async validateCoupon(code, cartTotal) {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon) return { valid: false, message: 'Invalid coupon code' };
    if (!coupon.active) return { valid: false, message: 'Coupon is inactive' };
    if (coupon.expiryDate && new Date(coupon.expiryDate.toDate()) < new Date()) {
      return { valid: false, message: 'Coupon has expired' };
    }
    if (coupon.minCartValue && cartTotal < coupon.minCartValue) {
      return { valid: false, message: `Minimum cart value ₹${coupon.minCartValue} required` };
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }

    return { valid: true, discount, coupon };
  },

  async incrementUsage(couponId) {
    const couponRef = doc(db, 'coupons', couponId);
    const couponSnap = await getDoc(couponRef);
    if (couponSnap.exists()) {
      await updateDoc(couponRef, {
        usedCount: (couponSnap.data().usedCount || 0) + 1
      });
    }
  }
};
