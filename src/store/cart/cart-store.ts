import type { CartProduct } from "@/interfaces";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  cart: CartProduct[];

  //Metodos para modificar el carrito de compras
  getTotalItems: () => number;
  getSummaryInformation: () => {
    subTotal: number;
    tax: number;
    total: number;
    itemsInCart: number;
  };
  //updateProductQuantity
  updateProductQuantity: (product: CartProduct, quantity: number) => void;
  //addProductoToCart
  addProductToCart: (product: CartProduct) => void;
  //removeProduct
  removeProduct: (product: CartProduct) => void;
  //Limpiar carrito
  clearCart: () => void;
}

export const useCartStore = create<State>()(
  persist(
    (set, get) => ({
      cart: [],

      //Methods
      getTotalItems: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.quantity, 0);
      },

      getSummaryInformation: () => {
        const { cart } = get();
        const subTotal = cart.reduce(
          (subTotal, product) => product.quantity * product.price + subTotal,
          0
        );

        const tax = subTotal * 0.15;
        const total = subTotal + tax;
        const itemsInCart = cart.reduce(
          (total, item) => total + item.quantity,
          0
        );

        return { subTotal, tax, total, itemsInCart };
      },

      addProductToCart: (product: CartProduct) => {
        const { cart } = get();

        //1. Revisar si el producto existe en el carrito con la talla seleccionada
        const productInCart = cart.some(
          (item) => item.id === product.id && item.size === product.size
        );

        //Insertar nuevo producto
        if (!productInCart) {
          set({ cart: [...cart, product] });
          return;
        }

        // 2 . Se que el producto existe por talla..., entonces tengo que incrementar la cantidad
        const updatedCartProducts = cart.map((item) => {
          if (item.id === product.id && item.size === product.size) {
            return { ...item, quantity: item.quantity + product.quantity };
          }
          return item;
        });
        set({ cart: updatedCartProducts });
      },
      updateProductQuantity: (product: CartProduct, quantity: number) => {
        const { cart } = get();

        const updateCartProducts = cart.map((item) => {
          if (item.id === product.id && item.size === product.size) {
            return { ...item, quantity: quantity };
          }
          return item;
        });
        set({ cart: updateCartProducts });
      },
      removeProduct: (product: CartProduct) => {
        const { cart } = get();

        const updatedCartProduct = cart.filter(
          (item) => item.id !== product.id || item.size !== product.size
        );
        set({ cart: updatedCartProduct });
      },
      clearCart: () => {
        set({ cart: [] });
      },
    }),
    {
      name: "shopping-cart",
      // skipHydration: true,
    }
  )
);
