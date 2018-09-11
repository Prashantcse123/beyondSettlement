const crm = require('../../../services/crm.service');

module.exports = async (req, res) => {
  if (!req.userProfile) {
    return res.status(404).json({
      error: {
        msg: 'No profile found',
      },
    });
  }

  const data = await crm.pullRolesTree().catch((error) => {
    console.error('ERROR: could not load roles_tree from CRM', error);

    return res.status(500).json({
      error: {
        msg: 'Could not load permissions',
        error,
      },
    });
  });
  const userData = data.users[req.userProfile.user_id];

  // add the third object here to override `permission` if you want to test
  // app under different user roles
  // Example: { permissions: ['SETTLEMENTS'] }
  return res.status(200).json(Object.assign({}, userData));
};
