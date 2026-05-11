export class CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export class CreateOrderDto {
  name: string;
  email: string;
  phone: string;
  address: string;
  deliveryZone: string;
  deliveryFee: number;
  notes?: string;
  items: CreateOrderItemDto[];
}
