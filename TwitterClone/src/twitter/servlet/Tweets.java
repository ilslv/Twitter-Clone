package twitter.servlet;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import twitter.entity.BooleanResponse;
import twitter.entity.Post;
import twitter.entity.Posts;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@WebServlet("/tweets/*")
public class Tweets extends HttpServlet {
    private void getPost(String id, HttpServletResponse resp) throws IOException {
        int postId;
        try {
            postId = Integer.parseInt(id);
        } catch (NumberFormatException e) {
            return;
        }

        Post post = Posts.get(postId);
        resp.getWriter().print(
                ((new GsonBuilder())
                        .setPrettyPrinting()
                        .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                        .create()
                ).toJson(post)
        );
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String requestJson = req.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
        List<Post> filteredPosts = Posts.filter(requestJson);
        resp.getWriter().print(
                ((new GsonBuilder())
                        .setPrettyPrinting()
                        .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                        .create()
                ).toJson(filteredPosts)
        );
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        List<String> uriList = Arrays.asList(req.getRequestURI().split("/"));
        String requestJson = req.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
        if (uriList.size() > 2 && uriList.get(2).equals("search")) {
            List<Post> filteredPosts = Posts.filter(requestJson);
            resp.getWriter().print(
                    ((new GsonBuilder())
                            .setPrettyPrinting()
                            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                            .create()
                    ).toJson(filteredPosts)
            );
        } else {
            //Adding post
            resp.getWriter().print(
                    new BooleanResponse(Posts.add(requestJson))
            );
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        List<String> uriList = Arrays.asList(req.getRequestURI().split("/"));
        int id;

        try {
            if (uriList.size() > 3 && uriList.get(3).equals("id")) {
                id = Integer.parseInt(uriList.get(3));
            } else if (req.getParameter("id") != null) {
                id = Integer.parseInt(req.getParameter("id"));
            } else {
                throw new NumberFormatException();
            }
        } catch (NumberFormatException e) {
            resp.getWriter().print(
                    new BooleanResponse(false)
            );
            return;
        }

        resp.getWriter().print(
                new BooleanResponse(Posts.remove(id))
        );
    }
}
