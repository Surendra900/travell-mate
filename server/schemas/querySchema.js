import { z } from 'zod';

export const TravelQuerySchema = z.object({
  origin: z.string().min(2, 'Origin must be at least 2 characters').max(80),
  destination: z.string().min(2, 'Destination must be at least 2 characters').max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional().or(z.literal('')),
  budget: z.number().nonnegative().optional(),
  modePreferences: z.enum(['Train', 'Flight', 'Bus', 'Any']).default('Any'),
  passengers: z.number().int().min(1).max(6).default(1)
});

export const RouteFactsSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  transferHub: z.string().optional().default(''),
  mode: z.string().default('Train'),
  durationHours: z.number().optional(),
  savingsPercent: z.number().optional(),
  layoverMinutes: z.number().optional(),
  train1: z.string().optional().default(''),
  train2: z.string().optional().default(''),
  totalFare: z.number().optional()
});
