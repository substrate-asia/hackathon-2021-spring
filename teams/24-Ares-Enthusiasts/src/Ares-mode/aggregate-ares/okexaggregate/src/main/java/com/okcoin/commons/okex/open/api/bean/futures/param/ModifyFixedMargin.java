package com.okcoin.commons.okex.open.api.bean.futures.param;

public class ModifyFixedMargin {
    private String underlying;
    private String type;

    public String getUnderlying() {
        return underlying;
    }

    public void setUnderlying(String underlying) {
        this.underlying = underlying;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
