declare module 'lucide-react';
declare module '@remotion/player';
declare module '@remotion/bundler';
declare module '@remotion/renderer';
declare module '@remotion/cli/config';
declare module 'remotion';
declare module '@radix-ui/react-slot';
declare module '@radix-ui/react-select';
declare module '@radix-ui/react-toast';
declare module '@radix-ui/react-progress';
declare module 'tailwind-merge';

declare module 'clsx' {
  export type ClassValue = string | number | boolean | undefined | null | ClassValue[] | Record<string, any>;
  export function clsx(...inputs: ClassValue[]): string;
}

declare module 'class-variance-authority' {
  export function cva(...args: any[]): any;
  export type VariantProps<T> = T extends (...args: any[]) => any
    ? Partial<Parameters<T>[0]>
    : never;
}
