package twitter;

import com.google.gson.Gson;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class Check extends HttpServlet {
    class JsonResponse {
        public boolean success;
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        JsonResponse r = new JsonResponse();
        r.success = true;

        Gson gson = new Gson();
        resp.getWriter().print(gson.toJson(r));
    }
}
