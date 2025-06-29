import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    constructor(private authService: AuthService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { email, password, client = 'mobile' } = request.body;

        // Validate user with client parameter
        const user = await this.authService.validateUser(email, password, client);
        if (!user) {
            return false;
        }

        // Attach user to request
        request.user = user;
        return true;
    }
}