import { UserService } from "@user/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import {
  CreateUserRequestDTO,
  GetUserResponseDTO,
  UpdateUserRequestDTO,
} from "../dto/dto";
import { plainToClass as serialize } from "class-transformer";

export class GetUserController {
  service: UserService;

  constructor() {
    this.service = new UserService();
  }

  get = async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        abort(res, 400, "'userId' was not given through query string");
        return;
      }
      const response = await this.service.getUser(userId);
      send(res, 200, response, GetUserResponseDTO);
    } catch (e: any) {
      abort(res, 500, e.toString());
    }
  };
}

export class CreateUserController {
  service: UserService;

  constructor() {
    this.service = new UserService();
  }

  post = async (req: Request, res: Response) => {
    try {
      const serialized = serialize(CreateUserRequestDTO, req.body);
      await this.service.createUser(serialized);
      send(res, 201, { message: "User created successfully" });
    } catch (e: any) {
      abort(res, 500, e.toString());
    }
  };
}

export class UpdateUserController {
  service: UserService;

  constructor() {
    this.service = new UserService();
  }

  put = async (req: Request, res: Response) => {
    try {
      const serialized = serialize(UpdateUserRequestDTO, req.body);
      await this.service.updateUser(serialized);
      send(res, 200, { message: "User updated successfully" });
    } catch (e: any) {
      abort(res, 500, e.toString());
    }
  };
}
