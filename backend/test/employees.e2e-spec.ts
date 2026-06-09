import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

describe('Employees (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'Admin@123' });
    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await getConnection().close();
    await app.close();
  });

  it('/POST employees', () => {
    return request(app.getHttpServer())
      .post('/employees')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ employeeCode: 'EMP999', hireDate: '2025-01-01', userId: 1 })
      .expect(201);
  });

  it('/GET employees', () => {
    return request(app.getHttpServer())
      .get('/employees')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});