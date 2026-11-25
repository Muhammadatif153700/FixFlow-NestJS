import { IsString, Length } from 'class-validator';

export class ReopenDto {
  @IsString()
  @Length(10, 500)
  reason: string;
}