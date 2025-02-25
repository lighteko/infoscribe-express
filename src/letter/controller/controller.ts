import { LetterService } from "@letter/service/service";
import { Request, Response } from "express";
import { abort, send } from "@src/output";
import { GetLetterDTO, DispatchLetterDTO } from "@letter/dto/dto";
import { serialize } from "ts-data-object";

export class LetterController {
  service: LetterService;
  constructor() {
    this.service = new LetterService();
  }

  post = async (req: Request, res: Response) => {
    try {
      const serialized = await serialize(DispatchLetterDTO, req.body);
      await this.service.dispatchLetter(serialized);
      send(res, 201, { message: "Letter dispatched successfully" });
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };

  get = async (req: Request, res: Response) => {
    try {
      const response = await this.service.getLetter(req.params.letterId);
      send(res, 200, response, GetLetterDTO);
    } catch (e: any) {
      abort(res, 500, String(e));
    }
  };
}

export class SendLetterController {
  service: LetterService;
  constructor() {
    this.service = new LetterService();
  }
}
