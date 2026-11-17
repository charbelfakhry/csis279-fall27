import { IsArray, IsInt, Min } from 'class-validator';

const MESSAGE = 'roleIds must be a list of role ids';

export class UserRolesDto {
  @IsArray({ message: MESSAGE })
  @IsInt({ each: true, message: MESSAGE })
  @Min(1, { each: true, message: MESSAGE })
  roleIds: number[];
}
