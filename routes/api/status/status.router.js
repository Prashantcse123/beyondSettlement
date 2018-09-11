module.exports = [
  {
    method: 'get',
    path: '/status',
    controller: (req, res) => {
      res.status(200).json('true');
    },
  },
];
