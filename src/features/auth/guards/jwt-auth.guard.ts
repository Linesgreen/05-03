import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
//TODO вынести в общую папку
//FROM HEADER
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
