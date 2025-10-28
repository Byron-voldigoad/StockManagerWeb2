import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientService } from './supabase-client';


export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;        // Nom de la catégorie
  category_color: string;  // Couleur de la catégorie
  quantity: number;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  // Dans supabase.service.ts
private supabase: SupabaseClient;
    client: any;

constructor() {
  this.supabase = SupabaseClientService.getInstance(); // ← Même instance
}

  // Récupérer tous les produits avec leurs catégories
  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        categories (
          name,
          color
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur Supabase:', error);
      return [];
    }
    
    // Transformer les données pour l'interface
    return data.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.image,
      category: item.categories.name,
      category_color: item.categories.color,
      quantity: item.quantity,
      created_at: item.created_at
    })) as Product[];
  }

  // Récupérer un produit par ID
  async getProductById(id: number): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        categories (
          name,
          color
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erreur Supabase:', error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      description: data.description,
      image: data.image,
      category: data.categories.name,
      category_color: data.categories.color,
      quantity: data.quantity,
      created_at: data.created_at
    } as Product;
  }

  // Récupérer les catégories uniques
  async getCategories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('name')
      .order('name');
    
    if (error) {
      console.error('Erreur Supabase:', error);
      return [];
    }
    
    const categoryNames = data.map(cat => cat.name);
    return ['Tous', ...categoryNames];
  }


private transformProductData(data: any): Product {
  return {
    id: data.id,
    name: data.name,
    price: data.price,
    description: data.description,
    image: data.image,
    category: data.categories.name,
    category_color: data.categories.color,
    quantity: data.quantity,
    created_at: data.created_at
  };
}

// Méthodes pour la gestion des produits
async createProduct(productData: any): Promise<Product | null> {
  // 1. Trouver l'ID de la catégorie
  const { data: categoryData } = await this.supabase
    .from('categories')
    .select('id')
    .eq('name', productData.category)
    .single();

  if (!categoryData) {
    console.error('Catégorie non trouvée:', productData.category);
    return null;
  }

  // 2. Insérer le produit
  const { data, error } = await this.supabase
    .from('products')
    .insert({
      name: productData.name,
      price: productData.price,
      description: productData.description,
      image: productData.image,
      category_id: categoryData.id,
      quantity: productData.quantity
    })
    .select(`
      *,
      categories (
        name,
        color
      )
    `)
    .single();

  if (error) {
    console.error('Erreur création produit:', error);
    return null;
  }

  return this.transformProductData(data);
}

async updateProduct(id: number, productData: any): Promise<Product | null> {
  // 1. Trouver l'ID de la catégorie
   console.log('🔄 Update Product - Données reçues:', { id, productData });
  const { data: categoryData, error: categoryError } = await this.supabase
    .from('categories')
    .select('id')
    .eq('name', productData.category)
    .single();

    console.log('📁 Catégorie trouvée:', categoryData, 'Erreur:', categoryError);

  if (categoryError || !categoryData) {
    console.error('Catégorie non trouvée:', categoryError);
    return null;
  }

  // 2. Préparer les données de mise à jour (sans updated_at s'il n'existe pas)
  const updateData: any = {
    name: productData.name,
    price: productData.price,
    description: productData.description,
    image: productData.image,
    category_id: categoryData.id,
    quantity: productData.quantity
  };

   console.log('📤 Données envoyées à Supabase:', updateData);

  // 3. Mettre à jour le produit
  const { data, error } = await this.supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      categories (
        name,
        color
      )
    `)
    .single();

    console.log('📥 Réponse Supabase:', data, 'Erreur:', error);

  if (error) {
    console.error('Erreur mise à jour produit:', error);
    console.error('Détails erreur:', error.details, error.hint, error.message);
    return null;
  }

  return this.transformProductData(data);
}

async deleteProduct(id: number): Promise<boolean> {
  const { error } = await this.supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erreur suppression produit:', error);
    return false;
  }

  return true;
}

// Upload d'image vers Supabase Storage
async uploadProductImage(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { data, error } = await this.supabase.storage
    .from('product-images') // Tu devras créer ce bucket
    .upload(filePath, file);

  if (error) {
    console.error('Erreur upload image:', error);
    return null;
  }

  // Retourner l'URL publique
  const { data: { publicUrl } } = this.supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

// Gestion complète des catégories
async getCategoriesWithStats(): Promise<any[]> {
  const { data, error } = await this.supabase
    .from('categories')
    .select(`
      *,
      products (id)
    `)
    .order('name');

  if (error) {
    console.error('Erreur catégories:', error);
    return [];
  }

  return data.map(cat => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    product_count: cat.products.length,
    created_at: cat.created_at
  }));
}

async createCategory(name: string, color: string = 'amber'): Promise<boolean> {
  const { error } = await this.supabase
    .from('categories')
    .insert({
      name: name.trim(),
      color: color
    });

  if (error) {
    console.error('Erreur création catégorie:', error);
    return false;
  }

  return true;
}

async updateCategory(id: number, name: string, color: string): Promise<boolean> {
  const { error } = await this.supabase
    .from('categories')
    .update({
      name: name.trim(),
      color: color,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Erreur modification catégorie:', error);
    return false;
  }

  return true;
}

async deleteCategory(id: number): Promise<{success: boolean, message?: string}> {
  try {
    // Vérifier s'il y a des produits dans cette catégorie
    const { data: products, error: productsError } = await this.supabase
      .from('products')
      .select('id, name')
      .eq('category_id', id);

    if (productsError) {
      console.error('Erreur vérification produits:', productsError);
      return { success: false, message: 'Erreur de vérification' };
    }

    if (products && products.length > 0) {
      const productNames = products.slice(0, 3).map(p => p.name).join(', ');
      const remaining = products.length - 3;
      const message = `Impossible de supprimer : ${products.length} produit(s) utilisent cette catégorie (${productNames}${remaining > 0 ? `... et ${remaining} autres` : ''})`;
      return { success: false, message };
    }

    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression catégorie:', error);
      return { success: false, message: 'Erreur lors de la suppression' };
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return { success: false, message: 'Erreur inattendue' };
  }
}

}