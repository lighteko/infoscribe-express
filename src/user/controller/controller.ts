import { UserService } from "@user/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import { GetUserResponseDTO, UpdateUserRequestDTO } from "@user/dto/dto";
import { serialize } from "ts-data-object";

export class UserController {
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
      abort(res, 500, String(e));
    }
  };

  put = async (req: Request, res: Response) => {
    try {
      const serialized = await serialize(UpdateUserRequestDTO, req.body);
      await this.service.updateUser(serialized);
      send(res, 200, { message: "User updated successfully" });
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}
