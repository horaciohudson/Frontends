export interface Customer {
  customerId: string; // UUID como string no frontend
  name: string;
  email: string;
  telephone: string; // Alinhado com o backend
  mobile?: string;
  
  // Campos calculados para compatibilidade
  phone?: string; // Alias para telephone
}
