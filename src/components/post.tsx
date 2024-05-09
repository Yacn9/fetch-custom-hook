import { FC, useMemo } from 'react';

import { useFetch } from '../hooks';
import { Post } from '../types';

const SinglePost: FC = () => {
  const { data, loading, error, refetch } = useFetch<Array<Post>>(
    'https://jsonplaceholder.typicode.com/posts',
    { userId: 1 }
  );

  const handleRefetch = () => refetch({ userId: 1 });
  const post = useMemo(() => data?.at(0), [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>First Post</h1>
      <button onClick={handleRefetch}>Refetch</button>
      <div>
        <h2>{post?.title}</h2>
        <p>{post?.body}</p>
      </div>
      <hr />
    </div>
  );
};

export default SinglePost;
