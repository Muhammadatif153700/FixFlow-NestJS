import { IsEnum, IsInt, IsOptional, IsString, Length } from 'class-validator';
import type { Priority } from '../../storage/storage.interface';

export class UpdateRequestDto {
  @IsOptional()
  @IsString()
  @Length(5, 100)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(20, 1000)
  description?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsString()
  @Length(2, 80)
  building?: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  room?: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  priority?: Priority;
}