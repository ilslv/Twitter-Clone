package twitter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@WebServlet("/tweets/*")
public class Tweets extends HttpServlet {
    private void getPost(String id, HttpServletResponse resp) throws IOException {
        Post post = Posts.get(id);
        resp.getWriter().print((new Gson()).toJson(post));
    }

    private void filterPosts(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int skip, top;

        try {
            skip = Integer.parseInt(req.getParameter("skip"));
            top = Integer.parseInt(req.getParameter("top"));
        } catch (NumberFormatException e) {
            skip = 0;
            top = 10;
        }

        Field[] filterFields = Arrays.stream(Post.class.getFields())
                .filter(field -> req.getParameter(field.getName()) != null).toArray(Field[]::new);

        Post[] filteredPosts = Posts.stream().filter(post -> {
            try {
                for (Field field : filterFields) {
                    String requestQuery = req.getParameter(field.getName());

                    if (Collection.class.isAssignableFrom(field.getType())) {
                        String[] entries = requestQuery.split("\\s");

                        for (String entry : entries) {
                            if (
                                    ((Collection) field.get(post))
                                            .stream()
                                            .filter(obj -> obj.toString().equals(entry))
                                            .count() == 0
                            ) {
                                return false;
                            }
                        }

                        return true;
                    } else {
                        return field.get(post).toString().equals(requestQuery);
                    }
                }
            } catch (IllegalAccessException e) {
                return false;
            }
            return true;
        }).sorted(Comparator.comparing((Post p) -> p.createdAt).reversed())
                .skip(skip).limit(top)
                .toArray(Post[]::new);

        resp.getWriter().print(((new GsonBuilder()).setPrettyPrinting().create()).toJson(filteredPosts));
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        List<String> uriList = Arrays.asList(req.getRequestURI().split("/"));
        try {
            switch (uriList.get(2)) {
                case ("id"):
                    getPost(uriList.get(3), resp);
                    break;
                case ("search"):
                    filterPosts(req, resp);
                    break;
                default:
                    resp.sendRedirect("/");
            }
        } catch (IndexOutOfBoundsException e) {
            String id = req.getParameter("id");
            if (id != null) {
                getPost(id, resp);
            } else {
                req.getRequestDispatcher("/").forward(req, resp);
            }
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String post = req.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
        boolean postAdded = Posts.add(post);
        resp.getWriter().print(postAdded ? "true" : "false");
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        List<String> uriList = Arrays.asList(req.getRequestURI().split("/"));
        String id = null;

        if (uriList.size() > 3 && uriList.get(3).equals("id")) {
            id = uriList.get(3);
        } else if (req.getParameter("id") != null) {
            id = req.getParameter("id");
        }

        resp.getWriter().print(Posts.remove(id));
    }
}
