(function (window) {
  window['env'] = window['env'] || {};

  // Ici tu mets les variables qui viennent de Vercel
  window['env']['NG_APP_SUPABASE_URL'] = '${NG_APP_SUPABASE_URL}';
  window['env']['NG_APP_SUPABASE_KEY'] = '${NG_APP_SUPABASE_KEY}';
})(this);
