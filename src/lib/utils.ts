import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function formatCurrency(amount: number): string {
  return "₹" + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatDate(dateStr: string): string {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [year, month, day] = dateStr.split("-");
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function getDateRange(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    // Skip Sundays (0)
    if (d.getDay() !== 0) {
      dates.push(d.toISOString().split("T")[0]);
    }
  }
  return dates;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  // Ensure 91 country code for Indian numbers
  const cleanPhone = digits.startsWith("91") && digits.length === 12
    ? digits
    : digits.length === 10
    ? `91${digits}`
    : digits;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
