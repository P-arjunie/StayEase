declare module 'firebase/auth/react-native' {
  import type { Auth, Persistence } from 'firebase/auth';
  export function initializeAuth(app: any, options?: any): Auth;
  export function getReactNativePersistence(storage: any): Persistence;
  export * from 'firebase/auth';
}
