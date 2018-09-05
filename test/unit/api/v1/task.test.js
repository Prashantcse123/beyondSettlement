const expect = require('expect.js');
const models = require('../../../../models');

describe('models/task', () => {
  before(() => models.sequelize.sync());

  beforeEach(() => {
    this.User = models.User;
    this.Task = models.Task;
  });

  describe('create', () => {
    it('creates a task', () =>
      this.User.create({ username: 'johndoe' })
        .bind(this)
        .then(user =>
          this.Task.create({ title: 'a title', userId: user.id }).then((task) => {
            expect(task.title).to.equal('a title');
          })));
  });
});
