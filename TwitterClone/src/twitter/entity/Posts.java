package twitter.entity;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class Posts {
    protected static Connection dbConnection;

    public static Post add(String postJson) {
        Gson gson = new GsonBuilder()
                .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                .create();
        Post newPost;

        try {
            newPost = gson.fromJson(postJson, Post.class);
            if (newPost == null ||
                    newPost.description == null ||
                    newPost.description.length() == 0) {
                return null;
            }
        } catch (JsonSyntaxException e) {
            return null;
        }

        newPost.createdAt = new java.util.Date();

        try {
            dbConnection.prepareStatement("start transaction;").execute();

            PreparedStatement addPost = dbConnection.prepareStatement("set @id = (select user_id from user where name = ?);");
            addPost.setString(1, newPost.author);
            addPost.execute();

            addPost = dbConnection.prepareStatement(
                    "insert into post (user_id, description, created_at, photo_link) values (@id, ?, ?, ?);",
                    Statement.RETURN_GENERATED_KEYS);
            addPost.setString(1, newPost.description);
            addPost.setTimestamp(2, new Timestamp(newPost.createdAt.getTime()));
            addPost.setString(3, newPost.photoLink);

            addPost.execute();

            ResultSet addPostResult = addPost.getGeneratedKeys();
            addPostResult.first();
            int postId = addPostResult.getInt(1);

            newPost.hashTags.forEach(tag -> {
                try {
                    PreparedStatement selectTag = dbConnection.prepareStatement(
                            "set @tag_name = ?;" +
                                    "insert ignore into tag (name) values (@tag_name);" +
                                    "set @id = (select tag_id from tag where name = @tag_name);" +
                                    "insert into post_has_tag (post_id, tag_id) values (?, @id);"
                    );
                    selectTag.setString(1, tag);
                    selectTag.setInt(2, postId);
                    selectTag.execute();
                } catch (SQLException e) {
                    return;
                }
            });

            dbConnection.prepareStatement("commit;").execute();

            return get(postId);

        } catch (SQLException | NullPointerException e) {
            return null;
        }
    }

    public static Post get(int id) {
        Post post = new Post();

        try {
            PreparedStatement idVar = dbConnection.prepareStatement(
                    "set @id = ?"
            );
            idVar.setInt(1, id);
            idVar.execute();

            PreparedStatement postQuery = dbConnection.prepareStatement(
                    "select * from post p join user u on p.user_id = u.user_id where post_id = @id"
            );

            ResultSet postQueryResult = postQuery.executeQuery();
            if (!postQueryResult.next()) {
                return null;
            }

            post.id = id;
            post.description = postQueryResult.getString(3);
            post.createdAt = postQueryResult.getTimestamp(4);
            post.photoLink = postQueryResult.getString(5);
            post.author = postQueryResult.getString(7);

            PreparedStatement tagsQuery = dbConnection.prepareStatement(
                    "select name from post_has_tag pht join tag t on pht.TAG_ID = t.TAG_ID where post_id = @id"
            );
            ResultSet tagsQueryResult = tagsQuery.executeQuery();
            while (tagsQueryResult.next()) {
                post.hashTags.add(tagsQueryResult.getString(1));
            }

            PreparedStatement likesQuery = dbConnection.prepareStatement(
                    "select name from post_was_liked pwl join user u on pwl.user_id = u.user_id where post_id = @id"
            );
            ResultSet likesQueryResult = likesQuery.executeQuery();
            while (likesQueryResult.next()) {
                post.likes.add(likesQueryResult.getString(1));
            }

        } catch (SQLException e) {
            return null;
        }

        return post;
    }

    public static boolean remove(int id) {
        try {
            dbConnection.prepareStatement("start transaction;").execute();

            PreparedStatement deletePost = dbConnection.prepareStatement("set @id = ?;");
            deletePost.setInt(1, id);
            deletePost.execute();

            int affectedRows = 0;
            affectedRows += dbConnection.prepareStatement("delete from post_has_tag where post_id = @id;").executeUpdate();
            affectedRows += dbConnection.prepareStatement("delete from post_was_liked where post_id = @id;").executeUpdate();
            affectedRows += dbConnection.prepareStatement("delete from post where post_id = @id;").executeUpdate();

            dbConnection.prepareStatement("commit;").execute();

            if (affectedRows == 0) {
                return false;
            }
        } catch (SQLException e) {
            return false;
        }

        return true;
    }

    public static List<Post> filter(String filterJson) {
        List<Post> result = new ArrayList<>();

        Gson gson = new GsonBuilder()
                .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                .create();

        PostFilter filter = new PostFilter();

        if (!filterJson.equals("")) {
            try {
                filter = gson.fromJson(filterJson, PostFilter.class);
            } catch (JsonSyntaxException e) {
                return result;
            }
        }

        try {
            String questions = ",?".repeat(filter.hashTags.size());

            String dateQuery = "";
            if (filter.createdFrom != null || filter.createdTo != null) {
                dateQuery = "where ";
                if (filter.createdFrom != null) {
                    dateQuery += "date(created_at) >= ? ";
                }
                if (filter.createdFrom != null && filter.createdTo != null) {
                    dateQuery += " and ";
                }
                if (filter.createdTo != null) {
                    dateQuery += "date(created_at) <= ? ";
                }
            }

            String authorQuery = "";
            if (filter.author != null) {
                if (!dateQuery.equals("")) {
                    authorQuery += " and ";
                } else {
                    authorQuery += "where ";
                }
                authorQuery += "u.name = ? ";
            }

            PreparedStatement filterQuery = dbConnection.prepareStatement(
                    "select \n" +
                            "    p.post_id,\n" +
                            "    coalesce(tags_count, 0) tags_count\n" +
                            "from \n" +
                            "    (select \n" +
                            "        post_id,\n" +
                            "        count(*) tags_count\n" +
                            "    from post_has_tag pht\n" +
                            "    join tag t on pht.tag_id = t.tag_id\n" +
                            "    where name in (''" + questions + ")\n" +
                            "    group by post_id) tc\n" +
                            "right join post p on p.post_id = tc.post_id\n" +
                            "join user u on p.user_id = u.user_id\n" +
                            dateQuery +
                            authorQuery +
                            "having (tags_count = ?)\n" +
                            "order by created_at desc\n" +
                            "limit ?, ?"
            );

            int offset = filter.hashTags.size();
            for (int i = 0; i < offset; i++) {
                filterQuery.setString(i + 1, filter.hashTags.get(i));
            }

            if (filter.createdFrom != null) {
                filterQuery.setDate(offset + 1, new Date(filter.createdFrom.getTime()));
                offset++;
            }
            if (filter.createdTo != null) {
                filterQuery.setDate(offset + 1, new Date(filter.createdTo.getTime()));
                offset++;
            }
            if (filter.author != null) {
                filterQuery.setString(offset + 1, filter.author);
                offset++;
            }
            filterQuery.setInt(offset + 1, filter.hashTags.size());
            filterQuery.setInt(offset + 2, filter.skip);
            filterQuery.setInt(offset + 3, filter.top);

            ResultSet filterQueryResult = filterQuery.executeQuery();

            while (filterQueryResult.next()) {
                result.add(get(filterQueryResult.getInt(1)));
            }

        } catch (SQLException e) {
            return result;
        }

        return result;
    }

    public static boolean addLike(int postId, String author) {
        try {
            PreparedStatement selectPost = dbConnection.prepareStatement(
                    "select *\n" +
                            "    from post_was_liked pwl\n" +
                            "    join user u on pwl.user_id = u.user_id\n" +
                            "    where name = ? and post_id = ?"
            );
            selectPost.setString(1, author);
            selectPost.setInt(2, postId);

            ResultSet selectPostResult = selectPost.executeQuery();
            if (selectPostResult.next()) {
                //Remove like
                int userId = selectPostResult.getInt(2);

                PreparedStatement deletePost = dbConnection.prepareStatement(
                        "delete from post_was_liked where post_id = ? and user_id = ?"
                );
                deletePost.setInt(1, postId);
                deletePost.setInt(2, userId);

                deletePost.execute();
            } else {
                //Add like
                PreparedStatement addLike = dbConnection.prepareStatement(
                        "insert into post_was_liked (post_id, user_id)\n" +
                                "select ?, user_id\n" +
                                "from user\n" +
                                "where name = ?"
                );
                addLike.setInt(1, postId);
                addLike.setString(2, author);

                addLike.execute();
            }
        } catch (SQLException e) {
            return false;
        }

        return true;
    }

    public static boolean findUser(String username) {
        try {
            PreparedStatement selectUser = dbConnection.prepareStatement(
                    "select *\n" +
                            "from user\n" +
                            "where name = ?"
            );
            selectUser.setString(1, username);

            ResultSet selectUserResult = selectUser.executeQuery();

            return selectUserResult.next();

        } catch (SQLException e) {
            return false;
        }

    }

    public static int edit(String postJson) throws IllegalArgumentException {
        Gson gson = new GsonBuilder()
                .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                .create();
        Post newPost;

        try {
            newPost = gson.fromJson(postJson, Post.class);
            if (newPost == null ||
                    newPost.id == 0 ||
                    newPost.description.length() == 0
            ) {
                throw new IllegalArgumentException();
            }
        } catch (JsonSyntaxException e) {
            throw new IllegalArgumentException();
        }

        try {
            dbConnection.prepareStatement("start transaction;").execute();

            PreparedStatement idVar = dbConnection.prepareStatement("set @id = ?;");
            idVar.setInt(1, newPost.id);
            idVar.execute();

            String photoLinkUpdate = (newPost.photoLink == null ? "" : ", photo_link = ?\n");

            PreparedStatement updatePost = dbConnection.prepareStatement(
                    "update post\n" +
                            "set\n" +
                            "    description = ?" +
                            photoLinkUpdate +
                            "where post_id = @id"
            );

            updatePost.setString(1, newPost.description);
            if (newPost.photoLink != null) {
                updatePost.setString(2, newPost.photoLink);
            }

            if (updatePost.executeUpdate() == 0) {
                throw new IllegalArgumentException();
            }

            dbConnection.prepareStatement("delete from post_has_tag where post_id = @id;").executeUpdate();

            newPost.hashTags.forEach(tag -> {
                try {
                    PreparedStatement selectTag = dbConnection.prepareStatement(
                            "set @tag_name = ?;" +
                                    "insert ignore into tag (name) values (@tag_name);" +
                                    "set @tag_id = (select tag_id from tag where name = @tag_name);" +
                                    "insert into post_has_tag (post_id, tag_id) values (@id, @tag_id);"
                    );
                    selectTag.setString(1, tag);
                    selectTag.execute();
                } catch (SQLException e) {
                    throw new IllegalArgumentException();
                }
            });

            dbConnection.prepareStatement("commit;").execute();

            return newPost.id;
        } catch (SQLException e) {
            throw new IllegalArgumentException();
        }
    }

    public static List<String> getAllAuthors() {
        List<String> result = new ArrayList<>();

        try {
            PreparedStatement selectAllAuthors = dbConnection.prepareStatement(
                    "select name\n" +
                            "from user"
            );

            ResultSet selectResult = selectAllAuthors.executeQuery();

            while (selectResult.next()) {
                result.add(selectResult.getString(1));
            }

        } catch (SQLException e) {
            return result;
        }

        return result;
    }

    public static List<String> getAllTags() {
        List<String> result = new ArrayList<>();

        try {
            PreparedStatement selectAllAuthors = dbConnection.prepareStatement(
                    "select name\n" +
                            "from tag"
            );

            ResultSet selectResult = selectAllAuthors.executeQuery();

            while (selectResult.next()) {
                result.add(selectResult.getString(1));
            }

        } catch (SQLException e) {
            return result;
        }

        return result;
    }
}
