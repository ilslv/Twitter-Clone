package twitter.entity;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class PostFilter {
    public Date createdFrom, createdTo;
    public List<String> hashTags = new ArrayList<>();
    public String author;
    public int skip = 0, top = 10;
}
