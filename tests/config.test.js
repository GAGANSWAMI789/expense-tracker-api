function loadConfig(env) {
  const original = { ...process.env };
  Object.assign(process.env, env);

  try {
    let config;
    jest.isolateModules(() => {
      config = require('../src/config');
    });
    return config;
  } finally {
    process.env = original;
  }
}

describe('config', () => {
  it('treats a numeric JWT_EXPIRES_IN as seconds', () => {
    expect(loadConfig({ JWT_EXPIRES_IN: '3600' }).jwtExpiresIn).toBe(3600);
  });

  it('keeps a duration string as is', () => {
    expect(loadConfig({ JWT_EXPIRES_IN: '12h' }).jwtExpiresIn).toBe('12h');
  });

  it('refuses to load without JWT_SECRET', () => {
    expect(() => loadConfig({ JWT_SECRET: '' })).toThrow('JWT_SECRET must be set');
  });
});
