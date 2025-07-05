import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CartState, CartSummary } from '@/interfaces/cart.interface';
import { Product, getProductPrice } from '@/interfaces/product.interface';

/**
 * Cart Store with Persistence
 * 
 * Cart Behavior:
 * - Anonymous users: Cart persists across sessions (localStorage)
 * - Logged-in users: Cart persists across sessions (localStorage)
 * - On logout: Cart is cleared for privacy/security
 * - On login: Cart is preserved (user might have added items while anonymous)
 * - On register: Cart is preserved (user might have added items while anonymous)
 * 
 * Future enhancement: Server-side cart synchronization for logged-in users
 */

interface CartStore extends CartState {
  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setLoading: (loading: boolean) => void;
  
  // User-specific cart operations
  mergeWithServerCart: (serverItems: CartItem[]) => void;
  syncWithUser: (userId: number) => void;
  
  // Computed values
  getSummary: () => CartSummary;
  getItemQuantity: (productId: number) => number;
  getItem: (productId: number) => CartItem | undefined;
  hasItem: (productId: number) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isOpen: false,
      isLoading: false,

      // Actions
      addItem: (product: Product, quantity: number = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.product.idProduct === product.idProduct);
          
          if (existingItem) {
            // Check if adding this quantity would exceed stock
            const newTotalQuantity = existingItem.quantity + quantity;
            if (newTotalQuantity > product.stockQuantity) {
              // Don't add if it would exceed stock
              return state;
            }
            
            // Update existing item quantity
            const updatedItems = state.items.map(item =>
              item.product.idProduct === product.idProduct
                ? { ...item, quantity: newTotalQuantity }
                : item
            );
            return { items: updatedItems };
          } else {
            // Check if initial quantity exceeds stock
            if (quantity > product.stockQuantity) {
              // Don't add if initial quantity exceeds stock
              return state;
            }
            
            // Add new item
            const newItem: CartItem = {
              product,
              quantity,
              addedAt: new Date()
            };
            return { items: [...state.items, newItem] };
          }
        });
      },

      removeItem: (productId: number) => {
        set((state) => ({
          items: state.items.filter(item => item.product.idProduct !== productId)
        }));
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => {
          const item = state.items.find(item => item.product.idProduct === productId);
          if (!item) return state;
          
          // Check if new quantity exceeds stock
          if (quantity > item.product.stockQuantity) {
            // Don't update if it would exceed stock
            return state;
          }
          
          const updatedItems = state.items.map(item =>
            item.product.idProduct === productId
              ? { ...item, quantity }
              : item
          );
          return { items: updatedItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // User-specific cart operations
      mergeWithServerCart: (serverItems: CartItem[]) => {
        set((state) => {
          const mergedItems = [...state.items];
          
          serverItems.forEach(serverItem => {
            const existingItem = mergedItems.find(item => 
              item.product.idProduct === serverItem.product.idProduct
            );
            
            if (existingItem) {
              // Merge quantities, respecting stock limits
              const newQuantity = Math.min(
                existingItem.quantity + serverItem.quantity,
                serverItem.product.stockQuantity
              );
              existingItem.quantity = newQuantity;
            } else {
              // Add new item if not already in cart
              mergedItems.push(serverItem);
            }
          });
          
          return { items: mergedItems };
        });
      },

      syncWithUser: (userId: number) => {
        // Future implementation: sync cart with server for logged-in users
        // This could load user's saved cart from server and merge with local cart
      },

      // Computed values
      getSummary: (): CartSummary => {
        const state = get();
        const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = state.items.reduce((sum, item) => sum + (getProductPrice(item.product) * item.quantity), 0);
        const currency = state.items.length > 0 ? state.items[0].product.currency : 'USD';
        
        return {
          totalItems,
          totalPrice,
          currency
        };
      },

      getItemQuantity: (productId: number): number => {
        const state = get();
        const item = state.items.find(item => item.product.idProduct === productId);
        return item ? item.quantity : 0;
      },

      getItem: (productId: number): CartItem | undefined => {
        const state = get();
        return state.items.find(item => item.product.idProduct === productId);
      },

      hasItem: (productId: number): boolean => {
        return get().getItemQuantity(productId) > 0;
      }
    }),
    {
      name: 'cart-storage',
      // Only persist items, not UI state
      partialize: (state) => ({ items: state.items }),
    }
  )
); 