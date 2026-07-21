import { IsNotEmpty } from 'class-validator';

export class CreateObjectDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}
