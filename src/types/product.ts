export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  price_per_unit: number;
  tax_percentage: number;
  category_id?: string;
  category_name?: string;
  image_url?: string;
  sku?: string;
  unit?: string;
  company_id?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
