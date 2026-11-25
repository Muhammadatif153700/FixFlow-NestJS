import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @Length(3, 50)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(10, 300)
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}