# Checkout State Machine - Mental Model

## Overview
Checkout is a **single-page execution flow** with no routing. All states exist within one component.

## Core State Objects

### 1. Product Search State
```typescript
{
  query: string           // Search input value
  filteredProducts: Product[]  // Computed from query
  isSearching: boolean    // Optional: for async search
}
```

### 2. Selected Product + Variant State
```typescript
{
  selectedProduct: Product | null
  selectedVariant: Variant | null  // e.g., size, color, type
  quantity: number        // Default: 1
}
```

### 3. Cart State
```typescript
{
  items: CartItem[]      // Array of { product, variant, quantity, price }
  subtotal: number       // Computed: sum of (price * quantity)
  tax: number            // Computed: subtotal * taxRate
  total: number          // Computed: subtotal + tax
}
```

### 4. Optional Customer State
```typescript
{
  customerId: string | null
  customerName: string | null
  customerEmail: string | null
  isGuest: boolean       // true if no customer selected
}
```

### 5. Payment State
```typescript
{
  method: 'cash' | 'card' | 'other' | null
  amountTendered: number | null
  change: number | null  // Computed: amountTendered - total
  isProcessing: boolean
  isComplete: boolean
  transactionId: string | null
}
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    INITIAL STATE                            │
│  - Search: empty                                            │
│  - Selected: null                                           │
│  - Cart: empty                                              │
│  - Customer: guest                                          │
│  - Payment: not started                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PRODUCT SELECTION STATE                        │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │ Search Query │ ───► │ Filtered     │                    │
│  │ (typing)     │      │ Products     │                    │
│  └──────────────┘      └──────────────┘                    │
│         │                    │                              │
│         └────────────────────┘                              │
│                            │                                │
│                            ▼                                │
│              ┌─────────────────────┐                       │
│              │ Product Selected    │                       │
│              │ + Variant Selected  │                       │
│              │ + Quantity Set      │                       │
│              └─────────────────────┘                       │
│                            │                                │
│                            ▼                                │
│              ┌─────────────────────┐                       │
│              │ Add to Cart         │                       │
│              └─────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CART STATE                              │
│  ┌──────────────────────────────────────┐                 │
│  │ Cart Items                            │                 │
│  │ - Update Quantity                     │                 │
│  │ - Remove Item                         │                 │
│  │ - Clear Cart                          │                 │
│  └──────────────────────────────────────┘                 │
│                            │                                │
│                            ▼                                │
│              ┌─────────────────────┐                       │
│              │ Cart Has Items?     │                       │
│              └─────────────────────┘                       │
│                   │              │                          │
│              YES  │              │  NO                       │
│                   ▼              ▼                          │
│         ┌──────────────┐  ┌──────────────┐                 │
│         │ Ready to     │  │ Disable      │                 │
│         │ Checkout     │  │ Checkout     │                 │
│         └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (User clicks "Process Payment")
┌─────────────────────────────────────────────────────────────┐
│              OPTIONAL CUSTOMER STATE                        │
│  ┌──────────────────────────────────────┐                 │
│  │ Customer Selection (Optional)         │                 │
│  │ - Select existing customer           │                 │
│  │ - Skip (guest checkout)              │                 │
│  └──────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    PAYMENT STATE                           │
│  ┌──────────────────────────────────────┐                 │
│  │ Payment Method Selection              │                 │
│  │ - Cash                                │                 │
│  │ - Card                                │                 │
│  │ - Other                               │                 │
│  └──────────────────────────────────────┘                 │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────┐                 │
│  │ Amount Entry                          │                 │
│  │ - Amount Tendered (if cash)          │                 │
│  │ - Card Processing (if card)          │                 │
│  └──────────────────────────────────────┘                 │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────┐                 │
│  │ Processing                            │                 │
│  │ - isProcessing: true                  │                 │
│  │ - Show loading state                  │                 │
│  └──────────────────────────────────────┘                 │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────┐                 │
│  │ Complete                              │                 │
│  │ - isComplete: true                    │                 │
│  │ - transactionId: generated            │                 │
│  │ - Show success/receipt                │                 │
│  └──────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    RESET STATE                            │
│  - Clear Cart                                              │
│  - Reset Search                                            │
│  - Reset Payment                                           │
│  - Return to Initial State                                 │
└─────────────────────────────────────────────────────────────┘
```

## State Transitions

### Transition Rules

1. **Search → Product Selection**
   - User types in search → `filteredProducts` updates
   - User clicks product → `selectedProduct` set
   - User selects variant (if applicable) → `selectedVariant` set
   - User sets quantity → `quantity` set

2. **Product Selection → Cart**
   - User clicks "Add to Cart" → Item added to `cart.items`
   - `selectedProduct` reset to null
   - Cart totals recalculated

3. **Cart → Payment**
   - User clicks "Process Payment" → Enter payment state
   - Cart must have items (validation)

4. **Payment → Complete**
   - Payment method selected → `payment.method` set
   - Amount processed → `payment.isProcessing` = true
   - Transaction complete → `payment.isComplete` = true
   - Transaction ID generated

5. **Complete → Reset**
   - After completion → All states reset to initial
   - Ready for next transaction

## State Dependencies

- **Cart totals** are computed from `cart.items` (derived state)
- **Payment change** is computed from `payment.amountTendered - cart.total` (derived state)
- **Checkout button** is disabled when `cart.items.length === 0` (derived state)

## Constraints

- No routing between states (all in one component)
- No global app state (self-contained)
- No navigation away from checkout
- States are sequential but can be modified (e.g., edit cart during payment selection)

## Implementation Notes

- All state managed with React `useState` or `useReducer`
- Derived values computed in render or `useMemo`
- State transitions triggered by user actions (clicks, inputs)
- No external dependencies on routing or global state
