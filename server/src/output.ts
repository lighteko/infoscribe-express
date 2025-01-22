import { ClassConstructor, plainToClass } from "class-transformer";
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
    const serialized = plainToClass(dto, data);
    res.status(code).send({ data: serialized });
  }
}

export function abort(res: Response, code: number, description: string) {
  res.status(code).send({ message: description });
}
