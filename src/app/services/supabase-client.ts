// Fichier: services/supabase-client.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

class SupabaseClientService {
  private static instance: SupabaseClient;

  static getInstance(): SupabaseClient {
    if (!this.instance) {
      this.instance = createClient(
        environment.supabaseUrl,
        environment.supabaseKey
      );
    }
    return this.instance;
  }
}

export { SupabaseClientService };