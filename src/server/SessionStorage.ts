import DormAgent from '../core/DormAgent';
import {generateUUID} from '../core/common/utils';

type Session = {
  agent: DormAgent;
  createdAt: Date;
};

class SessionStorage {
  private pool = new Map<string, Session>();

  create(agent: DormAgent): string {
    this.purgeOldSession();

    const sessionKey = generateUUID();

    this.pool.set(sessionKey, {
      agent,
      createdAt: new Date(),
    });

    this.dump();

    return sessionKey;
  }

  find(sessionKey: string): DormAgent | undefined {
    this.purgeOldSession();

    this.dump();

    return this.pool.get(sessionKey)?.agent;
  }

  private purgeOldSession() {
    const keysToDelete = [];

    const now = Date.now();

    for (const [key, session] of this.pool.entries()) {
      const age = now - session.createdAt.getTime();

      if (age > 1000 * 60 * 60 * 3) {
        // 세 시간 넘어가면 짤
        keysToDelete.push(key);
      }
    }

    if (keysToDelete.length > 0) {
      console.log(`오래된 세션 ${keysToDelete.length}개를 제거합니다.`);
    }

    for (const key of keysToDelete) {
      this.pool.delete(key);
    }
  }

  private dump() {
    console.log(`살아있는 세션: ${Array.from(this.pool.entries()).length}개`);
  }
}

export default new SessionStorage();
