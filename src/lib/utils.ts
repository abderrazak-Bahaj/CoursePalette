import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const categoryStyles = {
  'web-development': {
    icon: '💻',
    color: 'bg-blue-100 text-blue-800',
  },
  'data-science': {
    icon: '📊',
    color: 'bg-purple-100 text-purple-800',
  },
  business: {
    icon: '📈',
    color: 'bg-green-100 text-green-800',
  },
  design: {
    icon: '🎨',
    color: 'bg-pink-100 text-pink-800',
  },
  marketing: {
    icon: '🚀',
    color: 'bg-orange-100 text-orange-800',
  },
  photography: {
    icon: '📷',
    color: 'bg-teal-100 text-teal-800',
  },
  health: {
    icon: '🏋️‍♂️',
    color: 'bg-red-100 text-red-800',
  },
  music: {
    icon: '🎵',
    color: 'bg-yellow-100 text-yellow-800',
  },
  'personal-development': {
    icon: '🌱',
    color: 'bg-emerald-100 text-emerald-800',
  },
  'it-certification': {
    icon: '📜',
    color: 'bg-indigo-100 text-indigo-800',
  },
  'language-learning': {
    icon: '🈹',
    color: 'bg-sky-100 text-sky-800',
  },
  teaching: {
    icon: '👨‍🏫',
    color: 'bg-cyan-100 text-cyan-800',
  },
};
