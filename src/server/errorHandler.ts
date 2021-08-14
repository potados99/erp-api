import {ErrorRequestHandler} from 'express';

export function errorHandler(): ErrorRequestHandler {
  return (err, req, res, _ /** 파라미터 4개 없으면 작동 안함! */) => {
    return res.status(400).json({
      message: err.message,
    });
  };
}
