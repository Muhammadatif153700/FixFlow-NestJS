import { IsString, Length } from 'class-validator';

export class ResolveDto {
  @IsString()
  @Length(20, 1000)
  resolutionNote: string;
}