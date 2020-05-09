package twitter;

import java.util.Date;
import java.util.List;

public class Post {
    public String id;
    public String description;
    public Date createdAt;
    public String author;
    public String photoLink;
    public List<String> hashTags;
    public List<String> likes;
}
