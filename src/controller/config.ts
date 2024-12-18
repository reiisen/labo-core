import { Request, Response } from "express";
import { Config, getConfig, updateConfig } from "../extra/utility/config";

export const update = async (
  req: Request<Config>,
  res: Response<Config>
) => {
  const request: Config = req.body;

  try {
    await updateConfig(request);
  } catch {
    console.log("Request to update config failed.")
  }

  res.status(200).send(getConfig());
}

export const read = async (
  req: Request,
  res: Response<Config>
) => {
  try {
    const response = getConfig();
    res.status(200).send(response);
  } catch {
    res.status(400).send();
  }
}

export const getVite = async (
  req: Request,
  res: Response
) => {
  try {
    const response = process.env.FRONTEND_URL;
    res.status(200).send(response);
  } catch {
    res.status(400).send();
  }
}
