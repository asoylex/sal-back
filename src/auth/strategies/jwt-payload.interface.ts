export interface JwtPayload {
  sub: string; // ID del usuario (subject)
  email: string;
  role: string;
  iat?: number; // Fecha de creación (issued at - opcional)
  exp?: number; // Fecha de expiración (opcional)
}
