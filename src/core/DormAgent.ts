import BaseErpAgent from './base/BaseErpAgent';

/**
 * 통합정보 시스템에서 기숙사 관련 정보를 가져와주는 친구입니다.
 */
export default class DormAgent extends BaseErpAgent {
  /**
   * 사생 정보를 가져옵니다.
   */
  async getResidentInfo(): Promise<string> {
    const url = 'https://erp.inu.ac.kr:8443/aff/dmty/Dmsm0120Ctr/findDmty209List.do?menuId=M001134&pgmId=P000940';
    const data = `SSV:utf-8requestTimeStr=${Date.now()}Dataset:DS_COND_RowType_persNo:STRING(256)nm:STRING(256)tmGbn:STRING(256)yy:STRING(256)N${
      this.studentId
    }`;

    const response = await this.erpRequest(() => this.agent.post(url, data));

    return response.data;
  }

  /**
   * 상벌점 내역을 가져옵니다.
   */
  async getScores(): Promise<string> {
    const url = 'https://erp.inu.ac.kr:8443/aff/dmty/Dmsm0010Ctr/findDmty209ListTab02.do?menuId=M001134&pgmId=P000940';
    const data = `SSV:utf-8requestTimeStr=${Date.now()}Dataset:DS_COND_RowType_persNo:STRING(256)yy:STRING(256)tmGbn:STRING(256)N`;

    const response = await this.erpRequest(() => this.agent.post(url, data));

    return response.data;
  }

  /**
   * 공공요금 내역을 가져옵니다.
   */
  async getFees(): Promise<string> {
    const url = 'https://erp.inu.ac.kr:8443/aff/dmty/Dmsm0010Ctr/findDmty209ListTab07.do?menuId=M001134&pgmId=P000940';
    const data = `SSV:utf-8requestTimeStr=${Date.now()}Dataset:DS_COND_RowType_yy:STRING(256)tmGbn:STRING(256)domstuNo:STRING(256)N`;

    const response = await this.erpRequest(() => this.agent.post(url, data));

    return response.data;
  }
}
