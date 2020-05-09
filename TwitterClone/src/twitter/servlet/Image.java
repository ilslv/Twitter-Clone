package twitter;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

@WebServlet(value = "/image")
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

        String path = System.getProperty("catalina.home") + "\\webapps\\img\\";
        File image = new File(path + uniqueName);
        Files.copy(fileContent, image.toPath());

        resp.getWriter().print(uniqueName);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String fileName = req.getParameter("name");
        String path = System.getProperty("catalina.home") + "\\webapps\\img\\";

        try {
            FileInputStream fin = new FileInputStream(path + fileName);
            ServletOutputStream output = resp.getOutputStream();

            BufferedInputStream bin = new BufferedInputStream(fin);
            BufferedOutputStream bout = new BufferedOutputStream(output);

            resp.setContentType("image");

            int ch = 0;
            while ((ch = bin.read()) != -1) {
                bout.write(ch);
            }

            fin.close();
            output.flush();
            output.close();
            bin.close();
            bout.close();
        } catch (FileNotFoundException e) {
            resp.getWriter().write("false");
        }
    }
}
