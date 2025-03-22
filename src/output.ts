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
      validate(classInstance as object).then((errors) => {
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
  cookies: { accessToken: string; refreshToken: string }
) {
  res.cookie("accessToken", cookies.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 15,
  });
  res.cookie("refreshToken", cookies.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

export function clearTokens(res: Response) {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 15,
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

export function abort(res: Response, code: number, description: string) {
  res.status(code).send({ message: description });
}
