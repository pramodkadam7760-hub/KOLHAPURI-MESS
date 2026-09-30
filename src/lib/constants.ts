import { MenuItem } from './types';

export const MESS_DETAILS = {
  name: 'Kolhapuri Mess',
  tagline: 'Authentic Homestyle Maharashtrian Meals',
  address: 'Nath Pai Circle, Shahapur, Belagavi (Belgaum), Karnataka',
  googleMapsLink: 'https://www.google.com/search?kgmid=%2Fg%2F11y400lt0l&hl=en-IN&q=Kolhapuri%20mess',
  callPhones: ['7676866399', '9513183593'],
  whatsappPhone: '7760948562',
  whatsappLink: 'https://wa.me/917760948562?text=Hello%20Kolhapuri%20Mess,%20I%20want%20to%20inquire%20about%20meals',
  whatsappGroupLink: 'https://chat.whatsapp.com/IB1AEPBZMhvEJHbrIvqIZC',
};

export const UPI_DETAILS = {
  payeeName: 'SUVARNA KADAM',
  upiId: 'paytmqr6la3hf@ptys',
  merchantName: 'Kolhapuri Mess',
  phone: '7760948562'
};

export const PARCEL_CHARGE_PER_DAY = 10.00;
export const DEFAULT_SECURITY_DEPOSIT = 1000.00;

// Website Thali Categories (No prices on public website as requested)
export const WEBSITE_THALI_CATEGORIES = [
  {
    id: 'veg',
    name: 'Veg Thali',
    tagline: 'Homestyle Pure Veg Delight',
    image: '/images/veg_thali_real.jpg',
    description: 'Authentic Veg Thali served with fresh Chapatis (or Bhakri), spicy Rassa Aamti, seasonal Bhaji, fragrant Rice, salad and pickle.',
    highlights: ['Fresh Hot Chapatis / Bhakri', 'Authentic Rassa Aamti', 'Hygienic Homestyle Cooking']
  },
  {
    id: 'chicken',
    name: 'Chicken Thali',
    tagline: 'Authentic Kolhapuri Chicken Special',
    image: '/images/chicken_thali_real.jpg',
    description: 'Juicy chicken cooked in traditional spicy Kolhapuri masala, served with Tambda Rassa, Pandhra Rassa, Jowar Bhakri/Chapati & Rice.',
    highlights: ['Tambda Rassa & Pandhra Rassa', 'Chicken Sukka Special', 'Fresh Hot Chapatis']
  },
  {
    id: 'mutton',
    name: 'Mutton Thali',
    tagline: 'Royal Kolhapuri Mutton Feast',
    image: '/images/mutton_thali_real.jpg',
    description: 'Tender mutton slow-cooked in hand-ground Kolhapuri spices, served with signature Tambda & Pandhra Rassa, Bhakri & Basmati Rice.',
    highlights: ['Hand-ground Spices', 'Rich Tambda-Pandhra Rassa', 'Royal Culinary Taste']
  },
  {
    id: 'egg',
    name: 'Egg Thali',
    tagline: 'Protein Rich Egg Curry & Bhurji',
    image: '/images/egg_thali_hero.png',
    description: 'Delicious spicy Egg Curry and fresh Egg Bhurji served with hot chapatis, steamed rice, crisp onions and lemon.',
    highlights: ['Egg Curry + Bhurji Combo', 'Fresh Hot Chapatis', 'Quick & Nutritious']
  }
];

export const INITIAL_MENU_ITEMS: Omit<MenuItem, 'id'>[] = [
  { name: 'Full Thali', category: 'veg', price: 70, guest_price: 90, is_available: true, sort_order: 1 },
  { name: 'Full Thali (Bhakri)', category: 'veg', price: 80, guest_price: 90, is_available: true, sort_order: 2 },
  { name: '2 Chapati + Bhaji', category: 'veg', price: 50, guest_price: 50, is_available: true, sort_order: 3 },
  { name: '3 Chapati + Bhaji', category: 'veg', price: 65, guest_price: 65, is_available: true, sort_order: 4 },
  { name: '1 Chapati + Bhaji', category: 'veg', price: 35, guest_price: 35, is_available: true, sort_order: 5 },
  { name: '1 Chapati + Bhaji + Rice', category: 'veg', price: 60, guest_price: 60, is_available: true, sort_order: 6 },
  { name: 'Rice Aamti / Half Rice Aamti', category: 'veg', price: 40, guest_price: 40, is_available: true, sort_order: 7 },
  { name: 'Rice Aamti + Bhaji / Half Rice + Bhaji', category: 'veg', price: 50, guest_price: 50, is_available: true, sort_order: 8 },
  { name: 'Paneer Full Thali', category: 'veg', price: 80, guest_price: 80, is_available: true, sort_order: 9 },
  { name: 'Shev Bhaji Thali', category: 'veg', price: 80, guest_price: 80, is_available: true, sort_order: 10 },
  { name: 'Extra Chapati', category: 'extra', price: 12, guest_price: 12, is_available: true, sort_order: 11 },
  { name: 'Chicken Full Thali', category: 'non_veg', price: 150, guest_price: 150, is_available: true, sort_order: 12 },
  { name: 'Chicken Thali (1 Chapati)', category: 'non_veg', price: 140, guest_price: 140, is_available: true, sort_order: 13 },
  { name: 'Rice + Chicken', category: 'non_veg', price: 140, guest_price: 140, is_available: true, sort_order: 14 },
  { name: 'Full Bhurji Thali', category: 'egg', price: 80, guest_price: 80, is_available: true, sort_order: 15 },
  { name: 'Bhurji Thali (1 Chapati)', category: 'egg', price: 70, guest_price: 70, is_available: true, sort_order: 16 },
  { name: 'Full Egg Curry', category: 'egg', price: 80, guest_price: 80, is_available: true, sort_order: 17 },
  { name: 'Egg Curry (1 Egg)', category: 'egg', price: 70, guest_price: 70, is_available: true, sort_order: 18 },
  { name: 'Egg Bhurji + 2 Chapati', category: 'egg', price: 60, guest_price: 60, is_available: true, sort_order: 19 },
  { name: 'Egg Bhurji + 1 Chapati', category: 'egg', price: 45, guest_price: 45, is_available: true, sort_order: 20 }
];

export const GOOGLE_REVIEWS = [
  {
    id: 1,
    author: 'Rohan Deshmukh',
    role: 'Engineering Student',
    rating: 5,
    date: '1 week ago',
    text: 'Best homestyle Kolhapuri mess near Nath Pai Circle! The Tambda and Pandhra Rassa taste exactly like home. Hot chapatis and timely hostel parcel delivery every single day.',
    avatarBg: 'bg-amber-500'
  },
  {
    id: 2,
    author: 'Priya Kulkarni',
    role: 'Medical Student',
    rating: 5,
    date: '2 weeks ago',
    text: 'Extremely hygienic and delicious food. The Veg Thali is full of flavor with authentic Maharashtrian spices. Their digital billing system makes monthly payments so simple.',
    avatarBg: 'bg-emerald-600'
  },
  {
    id: 3,
    author: 'Amit Patil',
    role: 'Local Customer',
    rating: 5,
    date: '1 month ago',
    text: 'Superb Chicken Thali & Mutton Thali! The mutton sukka with jowar bhakri is a must try. Very polite service and reasonable mess monthly plans.',
    avatarBg: 'bg-blue-600'
  },
  {
    id: 4,
    author: 'Saurabh Joshi',
    role: 'Hostel Resident',
    rating: 5,
    date: '2 months ago',
    text: 'I have been taking their hostel parcel delivery for 6 months now. Meals always reach hot and fresh on time. Highly recommended for students in Shahapur!',
    avatarBg: 'bg-purple-600'
  }
];
