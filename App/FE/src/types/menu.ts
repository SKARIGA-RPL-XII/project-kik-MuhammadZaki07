export interface MenuDiscount {
  value_discount: number;
}

export interface MenuCategory {
  id: string;
  name: string;
}

export interface MenuStock {
  quantity: number;
  pivot?: {
    amount: number;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  menu_image: string;
  is_best_seller: boolean;
  category?: MenuCategory;
  discount?: MenuDiscount;
  stocks?: MenuStock[];
}

export interface CartItem {
  menu_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  item: MenuItem; 
}

export interface MenuCardProps {
  item: MenuItem;
  onOpenDetail: (item: MenuItem) => void;
  isAdded?: boolean;
}