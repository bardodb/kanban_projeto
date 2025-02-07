import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class MoveCardDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  fromColumnId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  toColumnId: string;
}
