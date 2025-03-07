import { NextFunction, Request, Response } from 'express';
import * as candidateService from '../services/candidateService';
import { deleteFromEveryBucket } from '../utils/cloud';
import ApiResult from '../utils/ApiResult';

const { succeed, failed } = ApiResult;

const candidateController = {
  create: async (request: Request, response: Response, next: NextFunction) => {
    const { worldcupId, newImgInfos } = request.body;
    try {
      await candidateService.saveWithInfo(newImgInfos, worldcupId);
      response.json(succeed(null));
    } catch (e) {
      response.status(400).json(failed('cannot create candidates'));
    }
  },

  update: async (request: Request, response: Response, next: NextFunction) => {
    const {
      params: { key },
      body: { newKey, name },
    } = request;
    try {
      await candidateService.patchCandidate(key, name, newKey);
      response.json(succeed(null));
    } catch (e) {
      response.status(400).json(failed('cannot patch candidate'));
    }
  },

  remove: async (request: Request, response: Response, next: NextFunction) => {
    const { key } = request.params;
    try {
      await Promise.all([deleteFromEveryBucket(key), candidateService.removeByKey(key)]);
      response.json(succeed(null));
    } catch (e) {
      response.status(400).json(failed('cannot delete candidate'));
    }
  },
};

export default candidateController;
