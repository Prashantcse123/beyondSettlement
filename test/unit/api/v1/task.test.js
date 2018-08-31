const expect = require('expect.js');

describe('models/task', () => {
  before(() => require('../../models').sequelize.sync());

  beforeEach(() => {
    this.User = require('../../models').User;
    this.Task = require('../../models').Task;
  });

  describe('create', () => {
    it('creates a task', () => this.User.create({ username: 'johndoe' })
      .bind(this)
      .then(user => this.Task.create({ title: 'a title', userId: user.id }).then((task) => {
        expect(task.title).to.equal('a title');
      })));
  });
});
