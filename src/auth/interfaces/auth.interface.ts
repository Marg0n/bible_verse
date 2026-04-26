export interface JwtPayload {
  sub: string; //? or number, depending on implementation
  email?: string;
  iat?: number;
  exp?: number;
}
