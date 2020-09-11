import { Resolver, Query, Ctx } from 'type-graphql';
import { MyContext } from 'src/types';
import { Post } from '../entities/Post';

//Resolver för att returnera en array av posts ifrån Mikro Orm
@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }
}
