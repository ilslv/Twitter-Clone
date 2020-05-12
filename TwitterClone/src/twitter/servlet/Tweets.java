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
        List<String> uriList = Arrays.asList(req.getRequestURI().split("/"));

        if (uriList.size() > 2) {
            //Get post by id
            try {
                int id = Integer.parseInt(uriList.get(2));
                Post post = Posts.get(id);

                if (post == null) {
                    throw new NumberFormatException();
                }

                resp.getWriter().print(
                        ((new GsonBuilder())
                                .setPrettyPrinting()
                                .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                                .create()
                        ).toJson(post)
                );
            } catch (NumberFormatException e) {
                resp.sendError(404);
            }
        } else {
            //Filtration
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
            Post post = Posts.add(requestJson);

            if (post != null) {
                resp.getWriter().print(
                        ((new GsonBuilder())
                                .setPrettyPrinting()
                                .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                                .create()
                        ).toJson(post)
                );
            } else {
                resp.sendError(400);
            }
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int id = 0;

        try {
            if (req.getParameter("id") != null) {
                id = Integer.parseInt(req.getParameter("id"));
            } else {
                throw new NumberFormatException();
            }
        } catch (NumberFormatException e) {
            resp.sendError(400);
        }

        if (Posts.remove(id)) {
            resp.getWriter().print(
                    new BooleanResponse(true)
            );
        } else {
            resp.sendError(404);
        }
    }
}
