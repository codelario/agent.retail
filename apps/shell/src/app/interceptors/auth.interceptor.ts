import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth/AuthService";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = inject(AuthService).token;
    const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
};