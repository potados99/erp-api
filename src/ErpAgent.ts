import axios, {AxiosResponse} from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import tough from 'tough-cookie';
import AES_Encode from './dirty/aesUtil';

// axios에다가 쿠키 저장 기능을 추가하기 위함입니다.
axiosCookieJarSupport(axios);

/**
 * 통합정보 시스템 API 대신 접근해주는 친구입니다.
 * 학번과 비밀번호를 보유하고 있으며, 필요할 때에 로그인을 수행합니다.
 */
export default class ErpAgent {
  constructor(private readonly studentId: string, private readonly password: string) {}

  private cookieJar = new tough.CookieJar();

  private agent = axios.create({
    withCredentials: true,
    jar: this.cookieJar,
  });

  async getFees() {
    const response = await this.erpRequest(() =>
      this.agent.post(
        'https://erp.inu.ac.kr:8443/aff/dmty/Dmsm0010Ctr/findDmty209ListTab07.do?menuId=M001134&pgmId=P000940',
        'SSV:utf-8WMONID=DqR30Lp_5fzrequestTimeStr=1626188334094Dataset:DS_COND_RowType_yy:STRING(256)tmGbn:STRING(256)domstuNo:STRING(256)N'
      )
    );

    return response.data;
  }

  private async erpRequest(request: () => Promise<AxiosResponse>, retry: number = 0): Promise<AxiosResponse> {
    if (retry >= 3) {
      throw new Error('확인좀 해보세요!');
    }

    const response = await request();

    const ok = typeof response.data === 'string' && response.data.startsWith('SSV:');

    if (!ok) {
      await this.signIn();

      return await this.erpRequest(request, retry + 1);
    }

    return response;
  }

  private async signIn() {
    console.log('아...로그인이 필요합니다. 로그인할게요.');

    await this.signInPortal();
    await this.signInErp();
  }

  private async signInPortal() {
    console.log('먼저 포탈에 로그인합니다..');

    const key = 'IxNxrnPVXAwqzCZh';

    const id = AES_Encode(this.studentId, key);
    const password = AES_Encode(this.password, key);

    const params = {
      commSessionKEY: key,
      langKnd: 'ko',
      _enpass_login_: 'submit',
      gateway: 'true',
      username: id,
      userId: id,
      password: password,
      vsrc: 'https://portal.inu.ac.kr:444/enpass/login?_epLogin_=enview&service=https://portal.inu.ac.kr:444/enview/user/enpassLoginProcess.face',
      userIdI: '',
      passwordI: '',
    };

    await this.agent.post(
      'https://portal.inu.ac.kr:444/enpass/login?_epLogin_=enview&service=https://portal.inu.ac.kr:444/enview/user/enpassLoginProcess.face',
      new URLSearchParams(params).toString()
    );
  }

  private async signInErp() {
    // 통합정보시스템 접근하기
    await this.agent.get('http://erp.inu.ac.kr:8881/com/SsoCtr/initPageWork.do?loginGbn=sso'); // 프로토콜과 포트까지 다 이유가 있음.
  }
}
