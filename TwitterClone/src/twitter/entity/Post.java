package twitter.entity;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Post {
    public String id;
    public String description;
    public Date createdAt;
    public String author;
    public String photoLink;
    public List<String> hashTags = new ArrayList<>();
    public List<String> likes = new ArrayList<>();
}
