const getPostContent = (client, postId) => client.query('SELECT * FROM posts WHERE id=?', postId);

const getModerator = (pool, postId) => pool.pooledQuery('SELECT * FROM users WHERE moderator=true AND postid=?', postId);

const getPostComments = async (client, postId, redisCache) => {
  const votes = await redisCache(postId + 1);
  const regionId = await client.query('SELECT region_id FROM regions where post_id=?', postId);
  return client.pool.pooledQuery('SELECT * FROM comments WHERE post_id=? AND region_id=? AND votes=?', postId, regionId, votes);
};

const getPost = async (dbClient, postId, redisCache) => {
  await getPostContent(dbClient, postId);
  const content = await getPostContent(dbClient, postId);
  const comments = await getPostComments(dbClient, postId, redisCache);
  const votes = await redisCache(postId);
  const moderator = await getModerator(dbClient.pool, postId);
  dbClient.commitSync();
  return {
    content, comments, votes, moderator,
  };
};

const getActiveUserCount = async (dbClient, botCount) => {
  const totalUsers = await dbClient.query('SELECT COUNT(*) FROM active_users;');
  return totalUsers - botCount;
};

module.exports = { getPost, getPostComments, getActiveUserCount };
