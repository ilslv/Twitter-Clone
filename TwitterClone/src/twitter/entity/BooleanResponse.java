package twitter.entity;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class BooleanResponse {
    public boolean success;

    public BooleanResponse(boolean b) {
        success = b;
    }

    @Override
    public String toString() {
        return ((new GsonBuilder()).setPrettyPrinting().create()).toJson(this);
    }
}
