import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseClientService } from './supabase-client';

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  image2?: string; // Deuxième image (optionnelle)
  image3?: string; // Troisième image (optionnelle)
  category: string; // Nom de la catégorie
  category_color: string; // Couleur de la catégorie
  quantity: number;
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  // Dans supabase.service.ts
  private supabase: SupabaseClient;
  client: any;

  constructor() {
    this.supabase = SupabaseClientService.getInstance();
    this.client = this.supabase;
  }

  // Récupérer tous les produits avec leurs catégories
  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select(
        `
        *,
        categories (
          name,
          color
        )
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur Supabase:', error);
      return [];
    }

    // Transformer les données pour l'interface
    return data.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.image,
      image2: item.image2,
      image3: item.image3,
      category: item.categories.name,
      category_color: item.categories.color,
      quantity: item.quantity,
      created_at: item.created_at,
    })) as Product[];
  }

  // Récupérer un produit par ID
  async getProductById(id: number): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select(
        `
        *,
        categories (
          name,
          color
        )
      `
      )
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
      image2: data.image2,
      image3: data.image3,
      category: data.categories.name,
      category_color: data.categories.color,
      quantity: data.quantity,
      created_at: data.created_at,
    } as Product;
  }

  // Récupérer les produits par catégorie (pour les produits similaires)
  async getProductsByCategory(category: string, limit: number = 4, excludeId?: number): Promise<Product[]> {
    // 1. Récupérer l'ID de la catégorie
    const { data: catData } = await this.supabase
      .from('categories')
      .select('id')
      .eq('name', category)
      .single();

    if (!catData) return [];

    // 2. Récupérer les produits de cette catégorie
    let query = this.supabase
      .from('products')
      .select(`
        *,
        categories (
          name,
          color
        )
      `)
      .eq('category_id', catData.id)
      .limit(limit);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur récupération produits similaires:', error);
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.image,
      image2: item.image2,
      image3: item.image3,
      category: item.categories.name,
      category_color: item.categories.color,
      quantity: item.quantity,
      created_at: item.created_at,
    })) as Product[];
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

    const categoryNames = data.map((cat) => cat.name);
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
      created_at: data.created_at,
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
        image2: productData.image2,
        image3: productData.image3,
        category_id: categoryData.id,
        quantity: productData.quantity,
      })
      .select(
        `
      *,
      categories (
        name,
        color
      )
    `
      )
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

    console.log(
      '📁 Catégorie trouvée:',
      categoryData,
      'Erreur:',
      categoryError
    );

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
      image2: productData.image2,
      image3: productData.image3,
      category_id: categoryData.id,
      quantity: productData.quantity,
    };

    console.log('📤 Données envoyées à Supabase:', updateData);

    // 3. Mettre à jour le produit
    const { data, error } = await this.supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select(
        `
      *,
      categories (
        name,
        color
      )
    `
      )
      .single();

    console.log('📥 Réponse Supabase:', data, 'Erreur:', error);

    if (error) {
      console.error('Erreur mise à jour produit:', error);
      console.error(
        'Détails erreur:',
        error.details,
        error.hint,
        error.message
      );
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
    const {
      data: { publicUrl },
    } = this.supabase.storage.from('product-images').getPublicUrl(filePath);

    return publicUrl;
  }

  // Gestion complète des catégories
  async getCategoriesWithStats(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select(
        `
      *,
      products (id)
    `
      )
      .order('name');

    if (error) {
      console.error('Erreur catégories:', error);
      return [];
    }

    return data.map((cat) => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      description: cat.description, // ← AJOUT
      product_count: cat.products.length,
      created_at: cat.created_at,
    }));
  }

  // Méthode createCategory
  async createCategory(name: string, color: string, description: string = ''): Promise<boolean> {
    const { error } = await this.supabase
      .from('categories')
      .insert([{
        name,
        color,
        description  // ← AJOUT
      }]);

    if (error) {
      console.error('Erreur création catégorie:', error);
      return false;
    }
    return true;
  }

  // Méthode updateCategory  
  async updateCategory(id: number, name: string, color: string, description: string = ''): Promise<boolean> {
    const { error } = await this.supabase
      .from('categories')
      .update({
        name,
        color,
        description  // ← AJOUT
      })
      .eq('id', id);

    if (error) {
      console.error('Erreur modification catégorie:', error);
      return false;
    }
    return true;
  }

  async deleteCategory(
    id: number
  ): Promise<{ success: boolean; message?: string }> {
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
        const productNames = products
          .slice(0, 3)
          .map((p) => p.name)
          .join(', ');
        const remaining = products.length - 3;
        const message = `Impossible de supprimer : ${products.length
          } produit(s) utilisent cette catégorie (${productNames}${remaining > 0 ? `... et ${remaining} autres` : ''
          })`;
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

  // Méthodes pour la gestion du stockage (Images)
  async listBucketFiles(bucketName: string = 'product-images'): Promise<any[]> {
    let path = '';
    if (bucketName === 'product-images') {
      path = 'products';
    }

    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error(`Erreur listing bucket ${bucketName}:`, error);
      return [];
    }

    // Ajouter l'URL publique pour chaque fichier
    return data
      .filter((file) => file.name !== '.emptyFolderPlaceholder') // Filtrer les placeholders
      .map((file) => {
        const fullPath = path ? `${path}/${file.name}` : file.name;

        const { data: { publicUrl } } = this.supabase.storage
          .from(bucketName)
          .getPublicUrl(fullPath);

        return {
          ...file,
          name: fullPath, // Utiliser le chemin complet pour l'affichage et la suppression
          shortName: file.name, // Garder le nom court pour l'affichage si besoin
          publicUrl
        };
      });
  }

  async deleteBucketFile(fileName: string, bucketName: string = 'product-images'): Promise<boolean> {
    console.log(`🗑️ Tentative de suppression: Bucket='${bucketName}', File='${fileName}'`);

    // Extraire le dossier et le nom de fichier
    const lastSlashIndex = fileName.lastIndexOf('/');
    const folder = lastSlashIndex !== -1 ? fileName.substring(0, lastSlashIndex) : '';
    const nameOnly = lastSlashIndex !== -1 ? fileName.substring(lastSlashIndex + 1) : fileName;

    console.log(`🔍 Vérification existence: Folder='${folder}', Name='${nameOnly}'`);

    const { data: searchData, error: searchError } = await this.supabase.storage
      .from(bucketName)
      .list(folder, {
        limit: 1,
        search: nameOnly
      });

    if (searchError) {
      console.error('❌ Erreur lors de la vérification du fichier:', searchError);
    } else if (!searchData || searchData.length === 0) {
      console.warn(`⚠️ Fichier introuvable avant suppression: ${fileName}`);
    } else {
      console.log('✅ Fichier trouvé avant suppression:', searchData[0]);
    }

    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.error(`❌ Erreur suppression fichier ${fileName}:`, error);
      return false;
    }

    if (!data || data.length === 0) {
      console.warn(`⚠️ Echec suppression ${fileName}. Tentative avec le nom court...`);

      // Fallback: Essayer de supprimer sans le dossier (au cas où le path serait différent)
      const nameOnly = fileName.split('/').pop() || fileName;
      if (nameOnly !== fileName) {
        console.log(`🗑️ Tentative fallback: File='${nameOnly}'`);
        const { data: dataFallback, error: errorFallback } = await this.supabase.storage
          .from(bucketName)
          .remove([nameOnly]);

        if (dataFallback && dataFallback.length > 0) {
          console.log('✅ Fichier supprimé avec succès (fallback):', dataFallback);
          return true;
        }
      }

      console.warn(`⚠️ Echec définitif suppression ${fileName}.`);
      return false;
    } else {
      console.log('✅ Fichier supprimé avec succès:', data);
      return true;
    }
  }
}
