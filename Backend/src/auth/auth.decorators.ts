import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { userek_rang } from '@prisma/client';
export interface AuthUser { id: number; rang: userek_rang; sessionId: string }
export const Public = () => SetMetadata('public', true);
export const Roles = (...roles: userek_rang[]) => SetMetadata('roles', roles);
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthUser => context.switchToHttp().getRequest<{ user: AuthUser }>().user);
