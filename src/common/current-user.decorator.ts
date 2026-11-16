import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AuthUser = { userId: string; email: string };

/** Use in a controller: `@CurrentUser() user: AuthUser` */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser => {
  return ctx.switchToHttp().getRequest().user;
});