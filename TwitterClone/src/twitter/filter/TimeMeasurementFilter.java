package twitter.filter;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

@WebFilter("/*")
public class TimeMeasurementFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        long start = System.currentTimeMillis();
        filterChain.doFilter(servletRequest, servletResponse);
        long end = System.currentTimeMillis();

        HttpServletRequest httpRequest = (HttpServletRequest) servletRequest;
        String method = httpRequest.getMethod();
        StringBuffer path = httpRequest.getRequestURL();

        System.out.println(String.format("%s - %s - %d ms", method, path, end - start));
    }

    @Override
    public void destroy() {
    }
}
