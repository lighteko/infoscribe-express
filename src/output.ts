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

export function abort(res: Response, code: number, description: string) {
  res.status(code).send({ message: description });
}
