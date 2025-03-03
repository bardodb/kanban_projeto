import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('GraphQL API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/graphql - getBoard query', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            getBoard {
              columns {
                id
                title
              }
            }
          }
        `
      })
      .expect(200)
      .expect(response => {
        expect(response.body.data).toBeDefined();
        expect(response.body.data.getBoard).toBeDefined();
      });
  });
});
