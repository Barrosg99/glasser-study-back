import { IsString, IsNotEmpty, IsOptional, IsArray } from "class-validator";

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsOptional()
  memberEmails?: string[];
}
