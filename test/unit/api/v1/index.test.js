const expect = require('expect.js');
const models = require('../../../../models');

describe('models/index', () => {
  it('returns the task model', () => {
    expect(models.Task).to.be.ok();
  });

  it('returns the user model', () => {
    expect(models.User).to.be.ok();
  });
});
