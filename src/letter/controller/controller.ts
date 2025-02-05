import { LetterService } from "@letter/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import {
  CreateLetterDTO,
  GetLetterDTO,
  CreateDispatchDTO,
} from "@letter/dto/dto";
import { serialize } from "ts-data-object";

export class CreateLetterController {
  service: LetterService;
  constructor() {
    this.service = new LetterService();
  }

  post = async (req: Request, res: Response) => {
    try {
      const serialized = await serialize(CreateLetterDTO, req.body);
      await this.service.createLetter(serialized);
      send(res, 201, { message: "Letter created successfully" });
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}

export class GetLetterController {
  service: LetterService;
  constructor() {
    this.service = new LetterService();
  }

  get = async (req: Request, res: Response) => {
    try {
      const response = await this.service.getLetter(req.params.letterId);
      send(res, 200, response, GetLetterDTO);
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  }
}

export class SendLetterController {
  service: LetterService;
  constructor() {
    this.service = new LetterService();
  }

  post = async (req: Request, res: Response) => {
    try {
      const serialized = await serialize(CreateDispatchDTO, req.body);
      await this.service.sendLetter(serialized);
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  }
}
