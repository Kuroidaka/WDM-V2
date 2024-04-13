import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrivilegeService } from "src/privilege/privilege.service";

@Injectable()
export class PageGuard implements CanActivate {
  constructor(
    private reflector:Reflector,
    private privilegeService:PrivilegeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const page = this.reflector.get<string>('page', context.getClass());
    if (!page) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    return this.privilegeService.userHasPermission(userId, page);
  }
}
