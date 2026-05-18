import { IsString } from 'class-validator';

export class AddUserToTeamDto {
  @IsString()
  userId: string;
}
