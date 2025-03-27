import { ClassConstructor, plainToClass, validate } from "ts-data-object";
import { CookieOptions, Response } from "express";

export function send(
  res: Response,
  code: number,
  data: object,
  dto: ClassConstructor<unknown> | null = null
) {
  if (!dto) {
    res.status(code).send(data);
  } else {
    try {
      const classInstance = plainToClass(dto, data);
      validate(classInstance as object).then((errors: any) => {
        if (errors.length > 0) {
          throw new Error("Validation failed");
        } else {
          res.status(code).send({ data });
        }
      });
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  }
}

export const sendTokens = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  data: any,
  isSessionOnly = false
) => {
  // Set proper cookie options based on environment
  const isProd = process.env.NODE_ENV === "production";

  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: !isSessionOnly ? 7 * 24 * 60 * 60 * 1000 : undefined,
  };

  // Set only refreshToken as a cookie
  res.cookie("refreshToken", `Bearer ${tokens.refreshToken}`, cookieOptions);

  // Include access token in response body instead of cookie
  const responseData = {
    ...data,
    accessToken: tokens.accessToken,
  };

  // Simple response without redirect logic
  res.status(200).json({ data: responseData });
};

export function clearRefreshToken(res: Response) {
  const isProd = process.env.NODE_ENV === "production";

  // Only clear the refresh token cookie since access token is no longer stored as a cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });

  res.status(200).send({ data: { message: "Log out succeeded" } });
}

export function abort(res: Response, code: number, description: string) {
  res.status(code).send({ data: { message: description } });
}
