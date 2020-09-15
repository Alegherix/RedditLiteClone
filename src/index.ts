import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/user';
import { PostResolver } from './resolvers/post';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from './types';
import cors from 'cors';

const main = async () => {
  const orm = await MikroORM.init(microConfig);

  // Kör migrationerna innan något annat
  await orm.getMigrator().up();

  // Initializerar ett express objekt
  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );

  app.use(
    session({
      // Namnet för våran cookie
      name: 'qid',
      // Säger åt express-session att vi använder redis med redis store
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 yr
        // I våran JS i frontend kan vi itne acessa cookien, bra för säkerhet
        httpOnly: true,
        secure: __prod__, // Cookie only works in https -> Kan skapa problem, så kan behöva sätta till false
        sameSite: 'lax', // csrf
      },
      saveUninitialized: false,
      // Secret som används för att storea cookien
      secret: 'nacmkbaoisfhjkvbhaskjdgfvbakbhakjdnalkd',
      // ser till att vi inte fortsätter pinga redis
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  //Skapar en GraphQL endpoint
  apolloServer.applyMiddleware({
    app,
    cors: {
      origin: false,
    },
  });

  // Berättar vilken port express ska lyssna på
  app.listen(3000, () => {
    console.log('Server started on localhost:3000');
  });
};

main();
