package com.okcoin.commons.okex.open.api.bean.spot.result;

import java.util.List;

public class CancelAlgoResult {
    private String instrument_id;
    private String order_type;
    private List<String> algo_ids;
    private String result;
    private String error_code;
    private String error_message;


    public List<String> getAlgo_ids() {
        return algo_ids;
    }

    public void setAlgo_ids(List<String> algo_ids) {
        this.algo_ids = algo_ids;
    }


    public String getInstrument_id() {
        return instrument_id;
    }

    public void setInstrument_id(String instrument_id) {
        this.instrument_id = instrument_id;
    }

    public String getOrder_type() {
        return order_type;
    }

    public void setOrder_type(String order_type) {
        this.order_type = order_type;
    }



    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getError_code() {
        return error_code;
    }

    public void setError_code(String error_code) {
        this.error_code = error_code;
    }

    public String getError_message() {
        return error_message;
    }

    public void setError_message(String error_message) {
        this.error_message = error_message;
    }



}
