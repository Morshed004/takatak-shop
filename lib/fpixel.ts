// lib/fpixel.ts

export const FB_PIXEL_ID = '2951254778543440';

export const event = (name: string, options = {}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', name, options);
  }
};