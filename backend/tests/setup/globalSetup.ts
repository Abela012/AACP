import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export async function setup() {
  mongod = await MongoMemoryServer.create({
    instance: { launchTimeout: 120000 },
  });
  process.env.NODE_ENV = 'test';
  process.env.MONGO_URI = mongod.getUri();
  process.env.ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'test-encryption-secret-min-32-chars';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-aacp';
  process.env.CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-mock-key';
  process.env.PORT = '0';
}

export async function teardown() {
  if (mongod) {
    await mongod.stop();
  }
}
