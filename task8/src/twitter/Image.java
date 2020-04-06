package twitter;

import javax.servlet.Filter;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebInitParam;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

@WebServlet(value = "/image",
            initParams =
                    {
                            @WebInitParam(name = "imageDir", value = "C:\\Users\\Ilya\\Pictures\\")
                    })
@MultipartConfig
public class Image extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        Part filePart = req.getPart("file");
        String fileName = Paths.get(filePart.getSubmittedFileName()).getFileName().toString();
        InputStream fileContent = filePart.getInputStream();

        String[] dotSeparated = fileName.split("\\.");
        String fileExtension = dotSeparated[dotSeparated.length - 1];
        String uniqueName = UUID.randomUUID().toString() + '.' + fileExtension;

        File image = new File(getInitParameter("imageDir") + uniqueName);
        Files.copy(fileContent, image.toPath());

        resp.getWriter().print(uniqueName);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String fileName = req.getParameter("name");
        File image = new File(getInitParameter("imageDir") + fileName);

        if (!image.exists()) {
            resp.getWriter().print("false");
        } else {
            resp.getWriter().print("<html>\n" +
                    "    <body>\n" +
                    "        <img src=\"file://" + getInitParameter("imageDir").replaceAll("\\\\", "/") + fileName + "\">\n" +
                    "    </body>\n" +
                    "</html>");
        }
    }
}
