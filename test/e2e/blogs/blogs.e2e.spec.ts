// noinspection DuplicatedCode

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import request from 'supertest';

import { AppModule } from '../../../src/app.module';
import { appSettings } from '../../../src/settings/aplly-app-setting';
import { BlogTestManager } from '../../common/blogTestManager';

describe('Blogs e2e', () => {
  let app: INestApplication;
  let httpServer;
  //let mongoServer: MongoMemoryServer;
  let blogTestManaget: BlogTestManager;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    appSettings(app);

    await app.init();

    httpServer = app.getHttpServer();

    //init blogTestManager
    blogTestManaget = new BlogTestManager(app);
    await request(httpServer).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
  });

  const adminData = {
    login: 'admin',
    password: 'qwerty',
  };

  const blogData = {
    name: 'test',
    description: 'description_test',
    websiteUrl: 'https://test.com',
  };

  const blogs: any[] = [];
  for (let i = 1; i < 13; i++) {
    blogs.push({
      name: `${blogData.name} ${i}`,
      description: `${blogData.description} ${i}`,
      websiteUrl: `https://google.com`,
    });
  }

  let blogsInDb: any = [];

  it('create 12 blogs', async function () {
    await blogTestManaget.createBlog(blogData, 401, { ...adminData, password: '1' });
    blogsInDb = [];
    for (const blog of blogs) {
      const bub = await blogTestManaget.createBlog(blog, 201);
      blogsInDb.push(bub.body);
    }
  });
  it('get 10( 12 total) blogs x1', async function () {
    const blogsResponse = await request(httpServer).get('/blogs?sortBy=id').expect(200);
    expect(blogsResponse.body.items.length).toBe(10);
    expect(blogsResponse.body.totalCount).toBe(12);
    expect(blogsResponse.body.items[0]).toEqual(blogsInDb[11]);
    expect(blogsResponse.body.items[1]).toEqual(blogsInDb[10]);
  });
  it('get blog by id', async function () {
    const blogsResponse = await request(httpServer).get(`/blogs/${blogsInDb[0].id}`).expect(200);
    expect(blogsResponse.body).toEqual(blogsInDb[0]);
  });
  it('get blog by id2', async function () {
    const blogsResponse = await request(httpServer).get(`/blogs/${blogsInDb[1].id}`).expect(200);
    expect(blogsResponse.body).toEqual(blogsInDb[1]);
  });
  it('get blog by id (dont exist)', async function () {
    await request(httpServer).get(`/blogs/123`).expect(404);
  });

  //--------------------Pagination tests ------------------
  it('get 10( 12 total) blogs x2', async function () {
    // sortDirection=asc
    // pageSize=5
    const blogsResponse = await request(httpServer).get('/blogs?sortDirection=asc&pageSize=5').expect(200);
    expect(blogsResponse.body.items.length).toBe(5);
    expect(blogsResponse.body.totalCount).toBe(12);
    expect(blogsResponse.body.pageSize).toBe(5);
    expect(blogsResponse.body.pagesCount).toBe(3);
    expect(blogsResponse.body.items[0]).toEqual(blogsInDb[0]);
    expect(blogsResponse.body.items[1]).toEqual(blogsInDb[1]);
    expect(blogsResponse.body.items[2]).toEqual(blogsInDb[2]);
    expect(blogsResponse.body.items[3]).toEqual(blogsInDb[3]);
    expect(blogsResponse.body.items[4]).toEqual(blogsInDb[4]);
  });

  it('get 10( 12 total) blogs x5', async function () {
    // sortDirection=asc
    // pageSize=5
    //pageNumber=2
    const blogsResponse = await request(httpServer).get('/blogs?sortDirection=asc&pageNumber=2&pageSize=5').expect(200);
    expect(blogsResponse.body.items.length).toBe(5);
    expect(blogsResponse.body.totalCount).toBe(12);
    expect(blogsResponse.body.pageSize).toBe(5);
    expect(blogsResponse.body.pagesCount).toBe(3);
    expect(blogsResponse.body.items[0]).toEqual(blogsInDb[5]);
    expect(blogsResponse.body.items[1]).toEqual(blogsInDb[6]);
    expect(blogsResponse.body.items[2]).toEqual(blogsInDb[7]);
    expect(blogsResponse.body.items[3]).toEqual(blogsInDb[8]);
    expect(blogsResponse.body.items[4]).toEqual(blogsInDb[9]);
  });
  it('get 10( 12 total) blogs x6', async function () {
    // sortDirection=asc
    // searchNameTerm=1
    const blogsResponse = await request(httpServer)
      .get('/blogs?searchNameTerm=1&sortDirection=asc&sortBy=id')
      .expect(200);
    expect(blogsResponse.body.items.length).toBe(4);
    expect(blogsResponse.body.totalCount).toBe(4);
    expect(blogsResponse.body.pageSize).toBe(10);
    expect(blogsResponse.body.pagesCount).toBe(1);
    expect(blogsResponse.body.items[0]).toEqual(blogsInDb[0]);
    expect(blogsResponse.body.items[1]).toEqual(blogsInDb[9]);
    expect(blogsResponse.body.items[2]).toEqual(blogsInDb[10]);
  });

  describe('get posts by blog id', () => {
    it('create post', async function () {
      await request(httpServer)
        .post(`/sa/blogs/${blogsInDb[0].id}/posts`)
        .auth(adminData.login, adminData.password)
        .send({
          title: 'teste1',
          shortDescription: 'about bee',
          content: 'bebebebebe',
        })
        .expect(201);
    });
    it('create post 2', async function () {
      await request(httpServer)
        .post(`/sa/blogs/${blogsInDb[0].id}/posts`)
        .auth(adminData.login, adminData.password)
        .send({
          title: 'teste2',
          shortDescription: 'about bee2',
          content: 'bebebebebe2',
        })
        .expect(201);
    });
    it('get posts in blog', async function () {
      const postInBlogResponse = await request(httpServer)
        .get(`/sa/blogs/${blogsInDb[0].id}/posts`)
        .auth(adminData.login, adminData.password)
        .expect(200);
      expect(postInBlogResponse.body.items.length).toBe(2);
    });
  });
});
