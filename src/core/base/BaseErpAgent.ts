import tough from 'tough-cookie';
import assert from 'assert';
import {oneOf} from '../common/utils';
import userAgents from './userAgents';
import AES_Encode from '../dirty/aesUtil';
import axios, {AxiosResponse} from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';

// axios에다가 쿠키 저장 기능을 추가하기 위함입니다.
axiosCookieJarSupport(axios);

/**
 * 통합정보 시스템 API 대신 접근해주는 친구입니다.
 * 학번과 비밀번호를 보유하고 있으며, 필요할 때에 로그인을 수행합니다.
 */
export default abstract class BaseErpAgent {
  constructor(protected readonly studentId: string, private readonly password: string) {
    this.agent.defaults.headers['User-Agent'] = oneOf(userAgents);
    this.agent.defaults.headers['REQFOUNDATAION'] = 'nexacro';
  }

  /**
   * 혹시라도 수동으로 쿠키에 접근할 일이 있을 수 있어 만들어 놓았습니다.
   */
  private cookieJar = new tough.CookieJar();

  /**
   * 요청 보낼 때에 쓰는 axios 인스턴스입니다.
   */
  protected agent = axios.create({
    withCredentials: true,
    jar: this.cookieJar,
  });

  /**
   * 직접 로그인합니다.
   * 본격적으로 요청을 보내기 전에 계정의 유효성을 알고 싶을 때에 사용합니다.
   */
  async signIn() {
    console.log('먼저 포탈에 로그인합니다..');
    await this.signInPortal();

    console.log('그리고 통합정보시스템에 로그인합니다..');
    await this.signInErp();
  }

  private async signInPortal() {
    // 이것은 상수여!
    const key = 'IxNxrnPVXAwqzCZh';

    const id = AES_Encode(this.studentId, key);
    const password = AES_Encode(this.password, key);

    // 로그인 요청은 여기다가 보냅니다.
    const portalLoginUrl =
      'https://portal.inu.ac.kr:444/enpass/login?_epLogin_=enview&service=https://portal.inu.ac.kr:444/enview/user/enpassLoginProcess.face';

    // 없으면 404 뜨거나 이상한데로 리다이렉트되는 파라미터입니다.
    const requiredParams = {
      username: id,
      password: password,
      _enpass_login_: 'submit',
    };

    // 없어도 로그인 잘 됩니다.
    // 왜 있는지 모르겠음.
    const optionalParams = {
      vsrc: portalLoginUrl,
      langKnd: 'ko',
      gateway: 'true',
      userId: id,
      userIdI: '',
      passwordI: '',
      commSessionKEY: key,
    };

    const result = await this.agent.post(portalLoginUrl, new URLSearchParams({...requiredParams, ...optionalParams}).toString());

    // 로그인 성공할 때에만 리다이렉트되는 경로가 있습니다.
    // 그 경로를 비교하여 로그인 성공 여부 판단의 기준으로 사용합니다.
    const successful = result.request.path === '/enview/portal/icu_stu/main_new';

    assert(successful, new Error(`포탈 로그인 실패했습니다: 마지막 리다이렉트 경로가 ${result.request.path} 입니다.`));
  }

  private async signInErp() {
    await this.agent.get('http://erp.inu.ac.kr:8881/com/SsoCtr/initPageWork.do?loginGbn=sso'); // 프로토콜과 포트까지 다 이유가 있음.
  }

  /**
   * 통합정보 시스템에 보내는 요청을 래핑해줍니다.
   *
   * 응답을 뜯어서 문제가 생기면 알리거나 로그인을 대신 해주거나 합니다.
   * @param request 요청 보내는 함수. axios 호출 결과를 반환하면 됨.
   * @param retry 몇 번째 재시도인지 나타내는 숫자. 특정 횟수 초과하면 뻗음.
   */
  protected async erpRequest(request: () => Promise<AxiosResponse>, retry: number = 0): Promise<AxiosResponse> {
    assert(retry < 3, new Error('확인좀 해보세요!'));

    const response = await request();

    const needLogin = typeof response.data === 'string' && response.data.includes('<Parameter id="ErrorCode" type="int">-600</Parameter>');
    const ok = typeof response.data === 'string' && response.data.startsWith('SSV:');

    if (needLogin) {
      await this.signIn();
      return await this.erpRequest(request, retry + 1);
    } else if (!ok) {
      throw new Error(`요청 실패했습니다. 응답: ${response.data}`);
    }

    return response;
  }
}
