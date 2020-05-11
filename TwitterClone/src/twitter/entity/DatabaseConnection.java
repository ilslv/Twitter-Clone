package twitter.entity;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ResourceBundle;

@WebListener
public class DatabaseConnection implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        ResourceBundle resource = ResourceBundle.getBundle("database");
        String url = resource.getString("url");
        String driver = resource.getString("driver");
        String user = resource.getString("user");
        String password = resource.getString("password");

        try {
            Class.forName(driver);
            Posts.dbConnection = DriverManager.getConnection(url, user, password);
            System.out.println(url);
        } catch (SQLException | ClassNotFoundException e) {
            System.err.println("Error: failed to establish database connection");
            System.exit(0);
        }
    }
}
