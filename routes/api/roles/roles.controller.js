const crm = require('../../../services/crm.service');

const getRolesTree = async (req, res) => {
  const data = await crm.pullRolesTree();
  // const data = await crm.syncTradelineNameToCrm(['TL-00037395', 'TL-00006075']);
  // const data = await crm.syncTradelineNameFromCrm(['TL-00037395', 'TL-00006075']);
  res.json({ ...data });
};

const syncFromCrm = async (req, res) => {
  crm.syncAllFromCrm();
  res.json({ data: 'ok' });
};

module.exports = {
  getRolesTree,
  syncFromCrm,
};
