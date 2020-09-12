import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/user';
import { PostResolver } from './resolvers/post';

const main = async () => {
  const orm = await MikroORM.init(microConfig);

  // Kör migrationerna innan något annat
  await orm.getMigrator().up();

  // Initializerar ett express objekt
  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  //Skapar en GraphQL endpoint
  apolloServer.applyMiddleware({ app });

  // Berättar vilken port express ska lyssna på
  app.listen(3000, () => {
    console.log('Server started on localhost:3000');
  });
};

main();
