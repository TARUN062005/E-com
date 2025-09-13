import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem } from '../types';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Cart state interface
interface CartState {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  isLoading: boolean;
}

// Cart actions
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: { items: CartItem[]; itemCount: number; totalPrice: number } }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

// Cart context interface
interface CartContextType extends CartState {
  addToCart: (productId: string, variantId: string, quantity?: number) => Promise<boolean>;
  updateCartItem: (itemId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

// Initial state
const initialState: CartState = {
  items: [],
  itemCount: 0,
  totalPrice: 0,
  isLoading: false,
};

// Cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items,
        itemCount: action.payload.itemCount,
        totalPrice: action.payload.totalPrice,
        isLoading: false,
      };
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId && 
                 item.variantId === action.payload.variantId
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
        };
        
        return {
          ...state,
          items: updatedItems,
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0),
        };
      } else {
        const updatedItems = [...state.items, action.payload];
        return {
          ...state,
          items: updatedItems,
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0),
        };
      }
    }
    case 'UPDATE_ITEM': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      return {
        ...state,
        items: updatedItems,
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0),
      };
    }
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: updatedItems,
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0),
      };
    }
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        itemCount: 0,
        totalPrice: 0,
      };
    default:
      return state;
  }
};

// Create context
const CartContext = createContext<CartContextType | null>(null);

// Cart provider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load cart data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated, user]);

  // Refresh cart from server
  const refreshCart = async () => {
    if (!isAuthenticated) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await cartService.getCart();
      if (response.success) {
        dispatch({
          type: 'SET_CART',
          payload: {
            items: response.data.items,
            itemCount: response.data.itemCount,
            totalPrice: response.data.totalPrice,
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Add item to cart
  const addToCart = async (productId: string, variantId: string, quantity: number = 1): Promise<boolean> => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return false;
    }

    try {
      const response = await cartService.addToCart({ productId, variantId, quantity });
      if (response.success) {
        await refreshCart(); // Refresh cart to get updated data
        toast.success('Item added to cart');
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
      return false;
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId: string, quantity: number): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      const response = await cartService.updateCartItem(itemId, { quantity });
      if (response.success) {
        dispatch({ type: 'UPDATE_ITEM', payload: { itemId, quantity } });
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update cart item';
      toast.error(message);
      return false;
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      const response = await cartService.removeFromCart(itemId);
      if (response.success) {
        dispatch({ type: 'REMOVE_ITEM', payload: itemId });
        toast.success('Item removed from cart');
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove item from cart';
      toast.error(message);
      return false;
    }
  };

  // Clear entire cart
  const clearCart = async (): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      const response = await cartService.clearCart();
      if (response.success) {
        dispatch({ type: 'CLEAR_CART' });
        toast.success('Cart cleared');
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      return false;
    }
  };

  const value: CartContextType = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;