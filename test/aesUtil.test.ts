import AES_Encode from '../src/dirty/aesUtil';

describe('aesUtil', () => {
  it('끝에 줄바꿈이 들어가야 한다.', async () => {
    const encrypted = AES_Encode('201701562', 'IxNxrnPVXAwqzCZh');

    expect(encrypted).toBe('qXnj5TpPvsaxopH+Hs++AQ==\r\n');
  });
});
