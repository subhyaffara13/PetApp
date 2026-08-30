import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsIn } from 'class-validator';

export class CreatePetProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['dog', 'cat', 'other'])
  species: string;

  @IsString()
  @IsNotEmpty()
  breed: string;

  @IsNumber()
  age: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  knownConditions?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergies?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  medications?: string[];
  
  @IsArray()
  @IsOptional()
  medicalHistory?: any[];
}
