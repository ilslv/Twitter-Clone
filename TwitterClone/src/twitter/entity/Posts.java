package twitter.entity;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

public class Posts {
    protected static Connection dbConnection;

    public static boolean add(String postJson) {
        Gson gson = new GsonBuilder()
                .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                .create();
        Post newPost;

        try {
            newPost = gson.fromJson(postJson, Post.class);
        } catch (JsonSyntaxException e) {
            return false;
        }

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
        } catch (SQLException | NullPointerException e) {
            return false;
        }

        return true;
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

            post.id = String.valueOf(id);
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
            PreparedStatement deletePost = dbConnection.prepareStatement(
                    "start transaction;" +
                            "set @id = ?;" +
                            "delete from post_has_tag where post_id = @id;" +
                            "delete from post_was_liked where post_id = @id;" +
                            "delete from post where post_id = @id;" +
                            "commit;"
            );

            deletePost.setInt(1, id);

            deletePost.execute();
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

        if (!filterJson.equals("")){
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
            if (filter.createdTo != null){
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
}
