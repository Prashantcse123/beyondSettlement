require('dotenv').config()
process.env.NODE_ENV = "test"
const app = require('../app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expectOutput = require('chai').expect;
chai.use(chaiHttp);

describe('Run set scorecard if user not authenticated', () => {
  test('It should response the GET method', async () => {
    const response = await chai.request(app).get('/api/beyond/calculations/scorecard/set');
    expect(response.statusCode).toBe(401);
  });
})

describe('Run set scorecard if authenticated', () => {
  test('It should response the GET method', async () => {
    const response = await chai.request(app).get('/api/beyond/calculations/scorecard/set');
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expectOutput(response).be.json;
    expectOutput(response.body).to.equal('Calculation started....');
  });
})

describe('run Set scorecard if server down', () => {
  test('It should response the GET method', async () => {
    const response = await chai.request(app).get('/api/beyond/calculations/scorecard/set');
    expect(response.statusCode).toBe(501);
  });
})

