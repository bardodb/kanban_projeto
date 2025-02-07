import { IsString, IsNotEmpty, IsOptional, IsHexColor } from 'class-validator';

export class UpdateCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsHexColor()
  @IsOptional()
  color?: string;
}
