// Fichier: services/supabase-client.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

class SupabaseClientService {
  private static instance: SupabaseClient;

  static getInstance(): SupabaseClient {
    if (!this.instance) {
      // Create a minimal storage adapter that wraps window.localStorage
      // to avoid supabase-js using navigator.locks internally. We return
      // promises to match the async storage adapter shape expected.
      const storageAdapter: any =
        typeof window !== 'undefined' && window.localStorage
          ? {
            getItem: (key: string) =>
              Promise.resolve(window.localStorage.getItem(key)),
            setItem: (key: string, value: string) =>
              Promise.resolve(window.localStorage.setItem(key, value)),
            removeItem: (key: string) =>
              Promise.resolve(window.localStorage.removeItem(key)),
          }
          : undefined;

      this.instance = createClient(
        environment.supabaseUrl,
        environment.supabaseKey,
        {
          auth: {
            storage: storageAdapter,
            // Disable automatic background/session operations that may
            // attempt to use navigator.locks (causing NavigatorLock errors
            // in some dev environments). This sacrifices some cross-tab
            // session persistence but avoids the LockManager noise.
            persistSession: true,
            detectSessionInUrl: true,
            autoRefreshToken: true,
          },
        }
      );
    }
    return this.instance;
  }
}

export { SupabaseClientService };
