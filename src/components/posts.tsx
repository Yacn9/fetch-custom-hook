import { FC } from 'react';

import { useFetch } from '../hooks';
import { Post } from '../types';

const Posts: FC = () => {
  const { data, loading, error, refetch } = useFetch<Array<Post>>(
    'https://jsonplaceholder.typicode.com/posts',
    { userId: 1 }
  );

  const handleRefetch = () => refetch({ userId: 1 });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Posts</h1>
      <button onClick={handleRefetch}>Refetch</button>
      <ul>
        {data?.map((post) => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Posts;
