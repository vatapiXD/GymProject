import { hashPassword, verifyPassword } from './password';
describe('Password hashing', () => {
  it('uses unique salts and verifies only the correct password', async () => {
    const first = await hashPassword('Example-password-123');
    const second = await hashPassword('Example-password-123');
    expect(first).not.toBe(second);
    expect(await verifyPassword('Example-password-123', first)).toBe(true);
    expect(await verifyPassword('incorrect', first)).toBe(false);
  });
  it.each(['', 'salt:', 'salt:garbage', 'a:00'])('rejects malformed hashes: %s', async stored => {
    expect(await verifyPassword('anything', stored)).toBe(false);
  });
});
