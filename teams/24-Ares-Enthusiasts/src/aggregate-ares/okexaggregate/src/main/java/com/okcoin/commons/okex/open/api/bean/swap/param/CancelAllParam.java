package com.okcoin.commons.okex.open.api.bean.swap.param;

public class CancelAllParam {
    private String instrument_id;

    public String getInstrument_id() {
        return instrument_id;
    }

    public void setInstrument_id(String instrument_id) {
        this.instrument_id = instrument_id;
    }

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }

    private String direction;

}
