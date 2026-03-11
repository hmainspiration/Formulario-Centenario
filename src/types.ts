export interface OrderItem {
  id?: number;
  product_type: string;
  design: string;
  size?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id?: number;
  customer_name: string;
  church: string;
  total_amount: number;
  items: OrderItem[];
  created_at?: string;
}

export interface ProductSize {
  label: string;
  group: string;
  price: number;
}

export interface ProductCatalogItem {
  id: string;
  name: string;
  designs: string[];
  sizes?: ProductSize[];
  price?: number;
}

export const CATALOG: Record<string, ProductCatalogItem> = {
  camisas: {
    id: "camisas",
    name: "Camisas Sublimadas",
    designs: ["Árbol", "100 Años", "Naciones"],
    sizes: [
      { label: "1", group: "Juveniles 0-8", price: 280 },
      { label: "2", group: "Juveniles 0-8", price: 280 },
      { label: "3", group: "Juveniles 0-8", price: 280 },
      { label: "4", group: "Juveniles 0-8", price: 280 },
      { label: "5", group: "Juveniles 0-8", price: 280 },
      { label: "6", group: "Juveniles 0-8", price: 280 },
      { label: "7", group: "Juveniles 0-8", price: 280 },
      { label: "8", group: "Juveniles 0-8", price: 280 },
      { label: "9", group: "10 a XL", price: 300 },
      { label: "10", group: "10 a XL", price: 300 },
      { label: "12", group: "10 a XL", price: 300 },
      { label: "14", group: "10 a XL", price: 300 },
      { label: "16", group: "10 a XL", price: 300 },
      { label: "S", group: "10 a XL", price: 300 },
      { label: "M", group: "10 a XL", price: 300 },
      { label: "L", group: "10 a XL", price: 300 },
      { label: "XL", group: "10 a XL", price: 300 },
      { label: "2XL", group: "2XL y 3XL", price: 340 },
      { label: "3XL", group: "2XL y 3XL", price: 340 },
    ]
  },
  tazas: {
    id: "tazas",
    name: "Tazas 11oz",
    designs: ["Árbol", "100 Años", "Naciones"],
    price: 150
  },
  termo_acero: {
    id: "termo_acero",
    name: "Termo Acero (Cafetera) 500ml",
    designs: ["Árbol", "100 Años", "Naciones"],
    price: 450
  },
  termo_aluminio: {
    id: "termo_aluminio",
    name: "Termo Aluminio 600ml",
    designs: ["Árbol", "100 Años", "Naciones"],
    price: 240
  },
  gorras: {
    id: "gorras",
    name: "Gorras (Malla)",
    designs: ["Árbol", "100 Años"],
    price: 180
  },
  llaveros: {
    id: "llaveros",
    name: "Llaveros Metálicos",
    designs: ["Árbol", "100 Años"],
    price: 120
  },
  retrato: {
    id: "retrato",
    name: "Retrato (Lámina Aluminio)",
    designs: ["NJG", "SJF", "AJG"],
    price: 300
  },
  foto: {
    id: "foto",
    name: "Foto (Papel Fotográfico)",
    designs: ["NJG", "SJF", "AJG"],
    price: 150
  }
};
