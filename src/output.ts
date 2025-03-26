import { ClassConstructor, plainToClass, validate } from "ts-data-object";
import { Response } from "express";

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

export function sendTokens(
  res: Response,
  cookies: { accessToken: string; refreshToken: string },
  message: object,
  redirect: string | null = null,
  isSessionOnly: boolean = true
) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("accessToken", cookies.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: isSessionOnly ? undefined : 1000 * 60 * 15,
  });
  res.cookie("refreshToken", cookies.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: isSessionOnly ? undefined : 1000 * 60 * 60 * 24 * 7,
  });
  if (!redirect) res.status(201).send({ data: message });
  else res.redirect(redirect);
}

export function clearTokens(res: Response) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
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
