package twitter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Stream;

public class Posts {
    private static List<Post> posts = new ArrayList<>();

    public static boolean add(String jsonPost) {
        Gson gson = new GsonBuilder()
                        .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                        .create();
        Post newPost;

        try {
            newPost = gson.fromJson(jsonPost, Post.class);
            if (newPost == null || newPost.description == null || newPost.author == null) {
                return false;
            }
        } catch (JsonSyntaxException e) {
            return false;
        }

        newPost.id = String.valueOf(posts.size() + 1);
        newPost.createdAt = new Date();

        posts.add(newPost);
        return true;
    }

    public static Post get(String id) {
        return posts.stream()
                    .filter(post -> post.id.equals(id))
                    .findAny()
                    .orElse(null);
    }

    public static Stream<Post> stream() {
        return posts.stream();
    }

    public static boolean remove(String id) {
        return posts.removeIf(post -> post.id.equals(id));
    }
}
