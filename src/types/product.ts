import { Unit } from './unit';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  price_per_unit: number;
  cost_price: number | null;
  packet_quantity: number;
  tax_percentage: number;
  category_id?: string | null;
  category_name?: string;
  unit_id?: string | null;
  unit?: Unit | null;
  image_url?: string;
  sku?: string;
  is_raw_material?: boolean;
  is_track_inventory?: boolean;
  open_stock?: number | null;
  is_semi_finished?: boolean;
  company_id?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
