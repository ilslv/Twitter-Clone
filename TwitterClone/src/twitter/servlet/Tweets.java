package twitter.servlet;

import com.google.gson.GsonBuilder;
import twitter.entity.BooleanResponse;
import twitter.entity.Post;
import twitter.entity.Posts;

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

        if (uriList.size() > 2 && uriList.get(2).equals("like")) {
            //Adding like to a post
            int id;
            String author;

            try {
                id = Integer.parseInt(req.getParameter("id"));
                author = req.getParameter("author");

                if (author == null) {
                    throw new NumberFormatException();
                }
            } catch (NumberFormatException e) {
                resp.sendError(400);
                return;
            }

            if (Posts.addLike(id, author)) {
                resp.getWriter().print(
                        new BooleanResponse(true)
                );
            } else {
                resp.sendError(400);
            }

        } else {
            //Adding post
            String requestJson = req.getReader().lines().collect(Collectors.joining(System.lineSeparator()));

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
        int id;

        try {
            id = Integer.parseInt(req.getParameter("id"));
        } catch (NumberFormatException e) {
            resp.sendError(400);
            return;
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
