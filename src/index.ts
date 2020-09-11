import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';

const main = async () => {
  const orm = await MikroORM.init(microConfig);

  // Kör migrationerna innan något annat
  await orm.getMigrator().up();

  // Deklarerar ett Post objekt
  const post = orm.em.create(Post, { title: 'My first post' });

  // Postar det till databasen
  await orm.em.persistAndFlush(post);

  const posts = await orm.em.find(Post, {});
  console.log(posts);

  // Initializerar ett express objekt
  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
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

// const initExpress = async () => {
//   // Duplikerad cost här, behöver orm objektet, så hade kunnat extrahera den alt passera den till metoden istället
//   const orm = await MikroORM.init(microConfig);
//   await orm.getMigrator().up();

//   // Initializerar ett express objekt
//   const app = express();

//   const apolloServer = new ApolloServer({
//     schema: await buildSchema({
//       resolvers: [HelloResolver, PostResolver],
//       validate: false,
//     }),
//     context: () => ({ em: orm.em }),
//   });

//   //Skapar en GraphQL endpoint
//   apolloServer.applyMiddleware({ app });

//   // Berättar vilken port express ska lyssna på
//   app.listen(3000, () => {
//     console.log('Server started on localhost:3000');
//   });
// };

// main().catch((err) => console.log(err));
main();
// initExpress();
