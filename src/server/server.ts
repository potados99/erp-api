import express from 'express';
import DormAgent from '../core/DormAgent';
import {errorHandler} from './errorHandler';
import assert from 'assert';
import SessionStorage from './SessionStorage';
import {asyncHandler} from './asyncHandler';

export default function startServer() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({extended: true}));

  app.post(
    '/login',
    asyncHandler(async (req, res) => {
      assert(req.body && typeof req.body === 'object', new Error('파라미터 확인해주세욧!'));
      const {studentId, password} = req.body;
      assert(studentId && password, new Error('studentId와 password가 필요해요!'));

      const agent = new DormAgent(studentId, password);
      await agent.signIn();
      const sessionKey = SessionStorage.create(agent);

      return res.header('Authorization', sessionKey).send();
    })
  );

  app.get(
    '/dorm/residentInfo',
    asyncHandler(async (req, res) => {
      const sessionKey = req.headers.authorization;
      assert(sessionKey, new Error('Authorization 헤더에 세션 키를 넣어서 보내주세요!'));
      const agent = SessionStorage.find(sessionKey);
      assert(agent, new Error('세션이 없습니다!'));

      const result = await agent.getResidentInfo();

      return res.send(result);
    })
  );

  app.get(
    '/dorm/scores',
    asyncHandler(async (req, res) => {
      const sessionKey = req.headers.authorization;
      assert(sessionKey, new Error('Authorization 헤더에 세션 키를 넣어서 보내주세요!'));
      const agent = SessionStorage.find(sessionKey);
      assert(agent, new Error('세션이 없습니다!'));

      const result = await agent.getScores();

      return res.send(result);
    })
  );

  app.get(
    '/dorm/fees',
    asyncHandler(async (req, res) => {
      const sessionKey = req.headers.authorization;
      assert(sessionKey, new Error('Authorization 헤더에 세션 키를 넣어서 보내주세요!'));
      const agent = SessionStorage.find(sessionKey);
      assert(agent, new Error('세션이 없습니다!'));

      const result = await agent.getFees();

      return res.send(result);
    })
  );

  app.use(errorHandler());

  console.log('서버 시작합니다.');

  app.listen(process.env.PORT);
}
