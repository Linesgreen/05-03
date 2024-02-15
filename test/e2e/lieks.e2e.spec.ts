// noinspection JSUnresolvedReference
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../../src/app.module';
import { appSettings } from '../../src/settings/aplly-app-setting';
import { AuthTestManager } from '../common/authTestManager';
import { BlogTestManager } from '../common/blogTestManager';
import { CommentTestManager } from '../common/commentTestManager';
import { PostTestManager } from '../common/postTestManager';
import { UserTestManager } from '../common/userTestManager';

const userCreateData = {
  login: 'logTest',
  password: 'qwerty',
  email: 'linesreen@mail.ru',
};
const user2CreateData = {
  login: '2logTest',
  password: '2qwerty',
  email: '2linesreen@mail.ru',
};
let token: string;
let token2: string;

let blogId: string;
let postId: string;
let commentsUser1;
let commentsUser2;
describe('Users e2e test', () => {
  let app: INestApplication;
  let httpServer;
  let postTestManager: PostTestManager;
  let blogTetsManager: BlogTestManager;
  let authTestManager: AuthTestManager;
  let commentTestManager: CommentTestManager;
  let userTestManager: UserTestManager;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();
    httpServer = app.getHttpServer();

    postTestManager = new PostTestManager(app);
    blogTetsManager = new BlogTestManager(app);
    authTestManager = new AuthTestManager(app);
    commentTestManager = new CommentTestManager(app);
    userTestManager = new UserTestManager(app);
    await request(httpServer).delete('/testing/all-data').expect(204);

    await userTestManager.createUser(201, userCreateData);
    await userTestManager.createUser(201, user2CreateData);

    const tokenspair = await authTestManager.getTokens(userCreateData.email, userCreateData.password);
    token = tokenspair.token;
    const tokenspair2 = await authTestManager.getTokens(user2CreateData.email, user2CreateData.password);
    token2 = tokenspair2.token;

    const response = await blogTetsManager.createBlog();
    blogId = response.body.id;

    const postResponse = await postTestManager.createPostToBlog(null, blogId);
    postId = postResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });
  describe('comments likes', () => {
    it('create comment from user1 and user2', async () => {
      commentsUser1 = await commentTestManager.createNcommentsToPost(5, postId, token);
      commentsUser2 = await commentTestManager.createNcommentsToPost(5, postId, token, 'user2');
    });
    it('like  comment user 1', async () => {
      await request(httpServer)
        .put(`/comments/${commentsUser1[0].id}/like-status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ likeStatus: 'Like' })
        .expect(204);
    });
    it('like and dislike comments user 2', async () => {
      await request(httpServer)
        .put(`/comments/${commentsUser1[0].id}/like-status`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ likeStatus: 'Dislike' })
        .expect(204);
      await request(httpServer)
        .put(`/comments/${commentsUser2[0].id}/like-status`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ likeStatus: 'Like' })
        .expect(204);
    });
    it('get comment by user 1 comments id', async () => {
      const comment1response = await request(httpServer)
        .get(`/comments/${commentsUser2[0].id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(comment1response.body.likesInfo.likesCount).toEqual(1);
      expect(comment1response.body.likesInfo.dislikesCount).toEqual(0);
      expect(comment1response.body.likesInfo.myStatus).toEqual('None');
    });
    it('change like to dislike  comment user 1', async () => {
      await request(httpServer)
        .put(`/comments/${commentsUser1[0].id}/like-status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ likeStatus: 'Dislike' })
        .expect(204);
    });
    it('get comment by user 1 comments id', async () => {
      const comment1response = await request(httpServer)
        .get(`/comments/${commentsUser1[0].id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(comment1response.body.likesInfo.likesCount).toEqual(0);
      expect(comment1response.body.likesInfo.dislikesCount).toEqual(2);
      expect(comment1response.body.likesInfo.myStatus).toEqual('Dislike');
    });
    it('get comments to post by user 1 ', async () => {
      const response = await request(httpServer)
        .get(`/posts/${postId}/comments?sortBy=content&sortDirection=asc`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(response.body.items.length).toEqual(10);
      expect(response.body.items[0].likesInfo.likesCount).toEqual(1);
      expect(response.body.items[0].likesInfo.dislikesCount).toEqual(0);
      expect(response.body.items[0].likesInfo.myStatus).toEqual('None');

      expect(response.body.items[1].likesInfo.likesCount).toEqual(0);
      expect(response.body.items[1].likesInfo.dislikesCount).toEqual(2);
      expect(response.body.items[1].likesInfo.myStatus).toEqual('Dislike');
    });
    it('get comments to post by user 2 ', async () => {
      const response = await request(httpServer)
        .get(`/posts/${postId}/comments?sortBy=content&sortDirection=asc`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);
      expect(response.body.items.length).toEqual(10);
      expect(response.body.items[0].likesInfo.likesCount).toEqual(1);
      expect(response.body.items[0].likesInfo.dislikesCount).toEqual(0);
      expect(response.body.items[0].likesInfo.myStatus).toEqual('Like');

      expect(response.body.items[1].likesInfo.likesCount).toEqual(0);
      expect(response.body.items[1].likesInfo.dislikesCount).toEqual(2);
      expect(response.body.items[1].likesInfo.myStatus).toEqual('Dislike');
    });
    it('change likes status to comment user 2', async () => {
      await request(httpServer)
        .put(`/comments/${commentsUser2[0].id}/like-status`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ likeStatus: 'Dislike' })
        .expect(204);
      await request(httpServer)
        .put(`/comments/${commentsUser1[0].id}/like-status`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ likeStatus: 'Like' })
        .expect(204);
      await request(httpServer)
        .put(`/comments/${commentsUser1[0].id}/like-status`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ likeStatus: 'Like' })
        .expect(204);
      await request(httpServer)
        .put(`/comments/${commentsUser1[0].id}/like-status`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ likeStatus: 'Like' })
        .expect(204);
    });
    it('get comments with new like status to post by user 2 ', async () => {
      const response = await request(httpServer)
        .get(`/posts/${postId}/comments?sortBy=content&sortDirection=asc`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);
      expect(response.body.items.length).toEqual(10);
      expect(response.body.items[0].likesInfo.likesCount).toEqual(0);
      expect(response.body.items[0].likesInfo.dislikesCount).toEqual(1);
      expect(response.body.items[0].likesInfo.myStatus).toEqual('Dislike');

      expect(response.body.items[1].likesInfo.likesCount).toEqual(1);
      expect(response.body.items[1].likesInfo.dislikesCount).toEqual(1);
      expect(response.body.items[1].likesInfo.myStatus).toEqual('Like');
    });
  });
});
