import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type UrgencyLevel = 'Urgent' | 'Soon' | 'Normal';
type Urgency = { level: UrgencyLevel; text: string; };

export function getDeliveryUrgency(date: Date): Urgency {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deliveryDate = new Date(date);
  deliveryDate.setHours(0, 0, 0, 0);

  const daysDiff = differenceInDays(deliveryDate, today);

  if (daysDiff <= 3) {
    return { level: 'Urgent', text: 'Urgente' };
  }
  if (daysDiff <= 10) {
    return { level: 'Soon', text: 'Pronto' };
  }
  return { level: 'Normal', text: 'Normal' };
}
