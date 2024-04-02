import { ReactElement, createContext, useReducer, useMemo } from "react";

export type CartItemType = {
  sku: string;
  name: string;
  price: number;
  qty: number;
};

// define state fo initial state, mine did not need this because my initial state is not an object
type CartStateType = { cart: CartItemType[] };

// initial state for useReducer
const initCartState: CartStateType = { cart: [] };

// enum?
const REDUCER_ACTION_TYPE = {
  ADD: "ADD",
  REMOVE: "REMOVE",
  QUANTITY: "QUANTITY",
  SUBMIT: "SUBMIT",
};

// What is this for??
export type ReducerActionType = typeof REDUCER_ACTION_TYPE;

// type for reducer action
export type ReducerAction = {
  type: string;
  payload?: CartItemType;
};

const reducer = (
  state: CartStateType,
  action: ReducerAction
): CartStateType => {
  switch (action.type) {
    case REDUCER_ACTION_TYPE.ADD: {
      if (!action.payload)
        throw new Error("action.payload is missing in ADD action");
      const { sku, name, price } = action.payload;

      const filteredCart: CartItemType[] = state.cart.filter(
        (item) => item.sku !== sku
      );

      const itemExists: CartItemType | undefined = state.cart.find(
        (item) => item.sku === sku
      );

      const qty = itemExists ? itemExists.qty + 1 : 1;

      return { ...state, cart: [...filteredCart, { sku, name, price, qty }] };
    }
    case REDUCER_ACTION_TYPE.REMOVE: {
      if (!action.payload)
        throw new Error("action.payload is missing in REMOVE action");

      const { sku } = action.payload;

      const filteredCart = state.cart.filter((item) => item.sku !== sku);

      return { ...state, cart: [...filteredCart] };
    }
    // case REDUCER_ACTION_TYPE.QUANTITY: {
    //   if (!action.payload)
    //     throw new Error("action.payload is missing in QUANTITY action");

    //     const {sku, qty} = action.payload

    // }
    // case REDUCER_ACTION_TYPE.SUBMIT: {
    // }
    default:
      return { ...state, cart: [] };
  }
};

// custom hook for using CartContext
const useCartContext = (initialCartState: CartStateType) => {
  const [state, dispatch] = useReducer(reducer, initialCartState);

  const REDUCER_ACTIONS = useMemo(() => {
    return REDUCER_ACTION_TYPE;
  }, []);

  const totalItems = state.cart.reduce((acc, cartItem) => {
    return (acc += cartItem.qty);
  }, 0);

  // Format currency
  const totalPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(
    state.cart.reduce((previousValue, cartItem) => {
      return previousValue + cartItem.qty * cartItem.price;
    }, 0)
  );

  // Sort cart
  const cart = state.cart.sort((a, b) => {
    const itemA = Number(a.sku.slice(-4));
    const itemB = Number(b.sku.slice(-4));
    return itemA - itemB;
  });

  return { dispatch, REDUCER_ACTIONS, totalItems, totalPrice, cart };
};

export type UseCartContextType = ReturnType<typeof useCartContext>;

const initCartContextState: UseCartContextType = {
  dispatch: () => {},
  REDUCER_ACTIONS: REDUCER_ACTION_TYPE,
  totalItems: 0,
  totalPrice: "",
  cart: [],
};

const CartContext = createContext<UseCartContextType>(initCartContextState);

type ChildrenType = { children?: ReactElement | ReactElement[] };

export const CartProvider = ({ children }: ChildrenType): ReactElement => {
  return (
    <CartContext.Provider value={useCartContext(initCartState)}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
