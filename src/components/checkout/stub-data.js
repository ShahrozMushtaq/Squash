// Stub product data with stock states and variants
export const STUB_PRODUCTS = [
  // Product WITHOUT variants
  {
    id: 1,
    name: "Court Rental - 1 Hour",
    price: 25.0,
    category: "Court Rental",
    stock: 10,
    stockState: "in_stock",
    hasVariants: false,
  },
  // Product WITH variants (Court Type)
  {
    id: 2,
    name: "Court Rental - 2 Hours",
    price: 45.0, // Base price (will be overridden by variant)
    category: "Court Rental",
    stock: 0, // Base stock (will be overridden by variant)
    stockState: "in_stock", // Base state (will be overridden by variant)
    hasVariants: true,
    variantType: "Court Type",
    variants: [
      {
        id: "standard",
        name: "Standard Court",
        price: 45.0,
        stock: 5,
        stockState: "in_stock",
      },
      {
        id: "premium",
        name: "Premium Court",
        price: 60.0,
        stock: 2,
        stockState: "low_stock",
      },
      {
        id: "championship",
        name: "Championship Court",
        price: 75.0,
        stock: 0,
        stockState: "out_of_stock",
      },
    ],
  },
  // Product WITHOUT variants
  {
    id: 3,
    name: "Racket Rental",
    price: 5.0,
    category: "Equipment",
    stock: 0,
    stockState: "out_of_stock",
    hasVariants: false,
  },
  // Product WITH variants (Racket Type)
  {
    id: 4,
    name: "Racket Rental - Premium",
    price: 8.0,
    category: "Equipment",
    stock: 0,
    stockState: "in_stock",
    hasVariants: true,
    variantType: "Racket Type",
    variants: [
      {
        id: "beginner",
        name: "Beginner",
        price: 8.0,
        stock: 10,
        stockState: "in_stock",
      },
      {
        id: "intermediate",
        name: "Intermediate",
        price: 12.0,
        stock: 3,
        stockState: "low_stock",
      },
      {
        id: "professional",
        name: "Professional",
        price: 15.0,
        stock: 0,
        stockState: "out_of_stock",
      },
    ],
  },
  // Product WITHOUT variants
  {
    id: 5,
    name: "Balls (3 pack)",
    price: 8.0,
    category: "Equipment",
    stock: 15,
    stockState: "in_stock",
    hasVariants: false,
  },
  // Product WITH variants (Size)
  {
    id: 6,
    name: "Water Bottle",
    price: 3.0,
    category: "Beverages",
    stock: 0,
    stockState: "in_stock",
    hasVariants: true,
    variantType: "Size",
    variants: [
      {
        id: "small",
        name: "Small (500ml)",
        price: 3.0,
        stock: 0,
        stockState: "out_of_stock",
      },
      {
        id: "large",
        name: "Large (1L)",
        price: 5.0,
        stock: 8,
        stockState: "in_stock",
      },
    ],
  },
  // Product WITHOUT variants
  {
    id: 7,
    name: "Energy Drink",
    price: 4.0,
    category: "Beverages",
    stock: 5,
    stockState: "in_stock",
    hasVariants: false,
  },
  // Product WITHOUT variants
  {
    id: 8,
    name: "Towel Rental",
    price: 2.0,
    category: "Equipment",
    stock: 1,
    stockState: "low_stock",
    hasVariants: false,
  },
  // Product WITHOUT variants
  {
    id: 9,
    name: "Grip Tape",
    price: 6.0,
    category: "Equipment",
    stock: 20,
    stockState: "in_stock",
    hasVariants: false,
  },
  // Product WITH variants (Size)
  {
    id: 10,
    name: "Squash Shoes Rental",
    price: 10.0,
    category: "Equipment",
    stock: 0,
    stockState: "in_stock",
    hasVariants: true,
    variantType: "Size",
    variants: [
      {
        id: "size-7",
        name: "Size 7",
        price: 10.0,
        stock: 2,
        stockState: "low_stock",
      },
      {
        id: "size-8",
        name: "Size 8",
        price: 10.0,
        stock: 5,
        stockState: "in_stock",
      },
      {
        id: "size-9",
        name: "Size 9",
        price: 10.0,
        stock: 0,
        stockState: "out_of_stock",
      },
      {
        id: "size-10",
        name: "Size 10",
        price: 10.0,
        stock: 1,
        stockState: "low_stock",
      },
    ],
  },
];

export const CATEGORIES = [
  "All",
  "Court Rental",
  "Equipment",
  "Beverages",
];
