import { IsString, IsNotEmpty, IsUUID, IsNumber, Min } from 'class-validator';

export class MoveCardDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  fromColumnId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  toColumnId: string;

  @IsNumber()
  @Min(0)
  position: number;
}
