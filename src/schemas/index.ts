import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const SignupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  trade: z.string().optional().default('Web Development'),
  craftTitle: z.string().optional(),
  experience: z.union([z.number(), z.string()]).optional().default(5),
  location: z.string().optional().default('Remote Available'),
  bio: z.string().optional(),
  skills: z.union([z.array(z.string()), z.string()]).optional(),
  image: z.string().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const AdminCredentialsSchema = z.object({
  currentPassword: z.string().min(1, 'Current master password is required'),
  newEmail: z.string().trim().email().optional(),
  newName: z.string().trim().min(2).optional(),
  newPassword: z.string().min(6).optional(),
});

export const WorkerProfileUpdateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  trade: z.string().optional(),
  craftTitle: z.string().optional(),
  image: z.string().optional(),
  badge: z.string().optional(),
  badgeLabel: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewsCount: z.number().int().min(0).optional(),
  hourlyRate: z.number().int().min(0).optional(),
  location: z.string().optional(),
  experienceYears: z.number().int().min(0).optional(),
  availability: z.string().optional(),
  instantBooking: z.boolean().optional(),
  workPreference: z.string().optional(),
  responseTime: z.string().optional(),
  language: z.string().optional(),
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  website: z.string().trim().optional(),
  bio: z.string().optional(),
  about: z.string().optional(),
  guarantee: z.string().optional(),
  status: z.enum(['published', 'draft']).optional(),
  featured: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
});

export const PlatformLinkSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Platform name is required'),
  url: z.string().trim().min(1, 'URL is required'),
  icon: z.string().optional().default('custom'),
  badge: z.string().optional().default('Verified Profile'),
  actionText: z.string().optional().default('Visit Profile'),
  active: z.boolean().optional().default(true),
});

export const PortfolioItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, 'Title is required'),
  category: z.string().optional().default('General'),
  year: z.string().optional(),
  image: z.string().trim().min(1, 'Image URL is required'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export const ExperienceItemSchema = z.object({
  id: z.string().optional(),
  role: z.string().trim().min(1, 'Role title is required'),
  company: z.string().trim().min(1, 'Company/Practice is required'),
  period: z.string().trim().min(1, 'Period is required'),
  description: z.string().optional(),
});

export const ReviewCreateSchema = z.object({
  workerId: z.string().min(1, 'Worker ID is required'),
  author: z.string().trim().min(2, 'Name must be at least 2 characters'),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional().default('Verified Client Review'),
  comment: z.string().trim().min(10, 'Review must be at least 10 characters'),
  deviceId: z.string().trim().min(1, 'Device identifier is required'),
});

export const ReviewModerateSchema = z.object({
  action: z.enum(['approve', 'flag', 'delete']),
});

export const CategoryCreateSchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const InquiryCreateSchema = z.object({
  workerId: z.string().min(1, 'Worker ID is required'),
  clientName: z.string().trim().min(2, 'Your name is required'),
  clientContact: z.string().trim().min(3, 'Contact information is required'),
  targetDate: z.string().optional(),
  hours: z.string().optional().default('4'),
  description: z.string().trim().min(5, 'Project description is required'),
});

