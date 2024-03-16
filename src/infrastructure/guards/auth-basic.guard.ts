import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

// Custom guard
// https://docs.nestjs.com/guards
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.headers['authorization'] !== 'Basic YWRtaW46cXdlcnR5') {
      console.log(request.headers['authorization']);

      throw new UnauthorizedException();
    }

    return true;
  }
}
