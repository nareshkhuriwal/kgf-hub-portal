// src/constants/navData.js

/** Centered navbar items (minimal style) */
export const NAV_ITEMS = [
  { label: "HOME", to: "/" },
  { label: "NEW", to: "/new" },
  { label: "SHOP", to: "/products" },
  { label: "MEN", to: "/products?cat=men" },
  { label: "WOMEN", to: "/products?cat=women" },
  { label: "KIDS", to: "/products?cat=kids" },
];

/**
 * Tabs used by an optional mega-menu (desktop).
 * Keep as Title Case for display, and use lowercased keys for query params.
 */
export const NAV_TABS = ["Men", "Women", "Kids", "New", "Sale"];

/** Columnar structure per tab (optional mega-menu data) */
export const NAV_STRUCTURE = {
  Men: [
    { heading: "Topwear",   links: ["T-Shirts", "Polos", "Shirts", "Sweatshirts"] },
    { heading: "Bottomwear",links: ["Jeans", "Chinos", "Joggers", "Shorts"] },
    { heading: "Ethnic",    links: ["Kurtas", "Nehru Jackets"] },
    { heading: "Activewear",links: ["Gym Tees", "Track Pants"] },
  ],
  Women: [
    { heading: "Topwear",          links: ["Tops", "T-Shirts", "Shirts", "Sweatshirts"] },
    { heading: "Bottomwear",       links: ["Jeans", "Trousers", "Skirts", "Shorts"] },
    { heading: "Ethnic & Festive", links: ["Kurtas", "Kurta Sets", "Sarees"] },
    { heading: "Activewear",       links: ["Tees", "Tights", "Sports Bras"] },
  ],
  Kids: [
    { heading: "Boys",       links: ["T-Shirts", "Shirts", "Jeans", "Shorts"] },
    { heading: "Girls",      links: ["Tops", "Dresses", "Jeans", "Skirts"] },
    { heading: "Essentials", links: ["Innerwear", "Nightwear"] },
    { heading: "Footwear",   links: ["Casual", "Sports"] },
  ],
  New: [
    { heading: "Just In", links: ["Latest Drops", "Trendy Fits", "Seasonal Picks"] },
  ],
  Sale: [
    { heading: "Shop by Discount", links: ["Under ₹799", "Under ₹1299", "50% Off", "Clearance"] },
  ],
};

/** Featured promos per tab (optional mega-menu tile) */
export const NAV_PROMOS = {
  Men:   { title: "Denim Days",   cta: "Shop Now →", img: "/promos/men-denim.jpg",    to: "/products?cat=men&tag=denim" },
  Women: { title: "Festive Edit", cta: "Explore →",  img: "/promos/women-festive.jpg", to: "/products?cat=women&tag=festive" },
  Kids:  { title: "Play Hard",    cta: "Shop Kids →",img: "/promos/kids-play.jpg",     to: "/products?cat=kids" },
  New:   { title: "Just Dropped", cta: "See New →",  img: "/promos/new.jpg",           to: "/products?sort=new" },
  Sale:  { title: "Big Savings",  cta: "Grab Deals →",img: "/promos/sale.jpg",         to: "/products?tag=sale" },
};

/** Pills shown when the search box is empty */
export const POPULAR_SEARCHES = [
  "Oversized Tee",
  "Polo T-Shirts",
  "Mom Jeans",
  "Kurta Sets",
  "Zip Hoodies",
  "Chinos",
];
