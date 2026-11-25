import { IsEnum, IsInt, IsString, Length } from 'class-validator';
import type { Priority } from '../../storage/storage.interface';

export class CreateRequestDto {
  @IsString()
  @Length(5, 100)
  title: string;

  @IsString()
  @Length(20, 1000)
  description: string;

  @IsInt()
  categoryId: number;

  @IsString()
  @Length(2, 80)
  building: string;

  @IsString()
  @Length(1, 30)
  room: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  priority: Priority;
}