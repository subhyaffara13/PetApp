import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DeliveryOrderItemDto {
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsBoolean()
  isEmergencyItem?: boolean;
}

export class GeoLocationDto {
  @IsString()
  type: 'Point';

  @IsArray()
  @IsNumber({}, { each: true })
  coordinates: [number, number];
}

export class CreateDeliveryOrderDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsObject()
  deliveryAddress: any;

  @ValidateNested()
  @Type(() => GeoLocationDto)
  deliveryLocation: GeoLocationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryOrderItemDto)
  items: DeliveryOrderItemDto[];
}

export class CreateStoreProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateStoreProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
