package twitter.entity;

import com.google.gson.Gson;

public class BooleanResponse {
    public boolean success;

    public BooleanResponse(boolean b) {
        success = b;
    }

    @Override
    public String toString() {
        return (new Gson()).toJson(this);
    }
}
