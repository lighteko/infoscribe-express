import { UserService } from "@user/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import { CreateUserRequestDTO, GetUserResponseDTO } from "../dto/dto";
import { plainToClass } from "class-transformer";

export class GetUserController {
  service: UserService;

  constructor() {
    this.service = new UserService();
  }

  async get(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;
      const response = await this.service.getUser(userId);
      send(res, 200, response, GetUserResponseDTO);
    } catch (e: any) {
      abort(res, 500, e.toString());
    }
  }
}

export class CreateUserController {
  service: UserService;

  constructor() {
    this.service = new UserService();
  }

  async post(req: Request, res: Response) {
    try {
      const serialized = plainToClass(CreateUserRequestDTO, req.body);
      await this.service.createUser(serialized);
      send(res, 200, { message: "User created successfully" });
    } catch (e: any) {
      abort(res, 500, e.toString());
    }
  }
}
