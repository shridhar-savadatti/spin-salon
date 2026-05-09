export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: number; // minutes
  price: number;
  image?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
}

export interface TimeSlot {
  id: string;
  time: string; // "HH:MM"
  isAvailable: boolean;
}

export interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string;
  time: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  staffId?: string;
  staffName?: string;
  servicesJson?: string;
  totalDuration?: number;
  discountCode?: string;
  discountAmount?: number;
  finalPrice?: number;
}

export interface BookingFormData {
  customerName: string;
  customerPhone: string;
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
  staffId?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  avatar?: string;
}

export interface Offer {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrder: number;
  validFor: "all" | "new";
  categoryFilter: string | null;
  maxUses: number | null;
  usesCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AppliedOffer {
  code: string;
  description: string;
  discountAmount: number;
  finalPrice: number;
}

export interface Campaign {
  id: string;
  name: string;
  messageTemplate: string;
  serviceFilter: string;
  weeksSinceVisit: number;
  status: "draft" | "sent";
  totalCustomers: number;
  sentCount: number;
  createdAt: string;
  sentAt?: string;
}

export interface CampaignCustomer {
  name: string;
  phone: string;
  serviceName: string;
  lastVisit: string;
  message: string;
  waLink: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: "haircut" | "coloring" | "styling" | "treatment";
  label?: string;
}
