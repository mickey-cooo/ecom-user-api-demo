import { Body, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import {
  ListRoleRequestBodyDTO,
  ParamsRoleRequestDTO,
} from './dto/role.request';
import { AuthGuard } from '../guard/auth.guard';
import { RoleGuard } from '../guard/role.guard';

@Controller('role')
@UseGuards(AuthGuard, RoleGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('/:id')
  async getRoleById(@Param() param: ParamsRoleRequestDTO): Promise<any> {
    try {
      return await this.roleService.getRoleById(param);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Get('/list')
  async getAllRoles(@Body() body: ListRoleRequestBodyDTO): Promise<any> {
    try {
      return await this.roleService.getAllRoles(body);
    } catch (error) {
      throw new Error(error);
    }
  }
}
