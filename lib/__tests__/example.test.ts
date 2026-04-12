// Test sederhana untuk memverifikasi Jest berfungsi
describe('Jest Configuration Test', () => {
  test('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle TypeScript', () => {
    const message: string = 'Hello Jest';
    expect(message).toBe('Hello Jest');
  });
});