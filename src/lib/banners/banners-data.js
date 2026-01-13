/**
 * Banners Data Structure
 * Hardcoded data for Banners management
 */

// Promoted products (from Catalog)
export const PROMOTED_PRODUCTS = [
  {
    id: 2,
    name: "Court Rental - 2 Hours",
    promotion: {
      isPromoted: true,
      priority: 2,
      promoLabel: "Popular",
    },
  },
  {
    id: 4,
    name: "Racket Rental - Premium",
    promotion: {
      isPromoted: true,
      priority: 1,
      promoLabel: "New",
    },
  },
  {
    id: 9,
    name: "Grip Tape",
    promotion: {
      isPromoted: true,
      priority: 3,
      promoLabel: "Staff Pick",
    },
  },
];

// Banners
export const BANNERS_DATA = [
  {
    id: "banner-1",
    type: "product",
    imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=300&fit=crop",
    headline: "Premium Court Rentals",
    subtext: "Book your court time now",
    ctaLink: "/catalog",
    ctaText: "View Courts",
    isActive: true,
    isPrimary: true,
    displayPriority: 1,
    associatedProducts: [2, 4], // Product IDs
    startDate: "2024-01-01T00:00:00Z",
    endDate: null,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
  },
  {
    id: "banner-2",
    type: "static",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=300&fit=crop",
    headline: "New Equipment Arrivals",
    subtext: "Check out our latest rackets and gear",
    ctaLink: "/catalog?category=equipment",
    ctaText: "Shop Now",
    isActive: true,
    isPrimary: false,
    displayPriority: 2,
    associatedProducts: [],
    startDate: "2024-01-10T00:00:00Z",
    endDate: "2024-02-10T23:59:59Z",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-10T09:00:00Z",
  },
  {
    id: "banner-3",
    type: "static",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=300&fit=crop",
    headline: "Membership Special",
    subtext: "Join now and get 20% off your first month",
    ctaLink: "/membership",
    ctaText: "Learn More",
    isActive: false,
    isPrimary: false,
    displayPriority: 3,
    associatedProducts: [],
    startDate: null,
    endDate: null,
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-05T10:00:00Z",
  },
];

// Helper function to get banner by ID
export function getBannerById(bannerId) {
  return BANNERS_DATA.find((b) => b.id === bannerId);
}

// Helper function to get promoted products
export function getPromotedProducts() {
  return PROMOTED_PRODUCTS;
}
