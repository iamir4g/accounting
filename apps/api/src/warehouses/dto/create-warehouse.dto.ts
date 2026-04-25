import { IsOptional, IsString } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  nameFa!: string;

  @IsOptional()
  @IsString()
  address?: string;
}

