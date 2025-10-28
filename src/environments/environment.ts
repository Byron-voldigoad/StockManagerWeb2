// export const environment = {
//   production: false,
//   supabaseUrl: 'https://zcdzsvkoszkwhtwiskkp.supabase.co',
//   supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZHpzdmtvc3prd2h0d2lza2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTAwODUsImV4cCI6MjA3NjMyNjA4NX0.wjMZBljEdUyKWs_owQZzfchnOKNYoU_Co59CYH3hQTY'
// };

export const environment = {
  production: true,
  supabaseUrl: (window as any)['env']['NG_APP_SUPABASE_URL'] || '',
  supabaseKey: (window as any)['env']['NG_APP_SUPABASE_KEY'] || ''
};


