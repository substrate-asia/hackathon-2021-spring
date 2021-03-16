package com.okcoin.commons.okex.open.api.bean.swap.param;

import java.util.List;

public class AmendOrderParam {

    public List<AmendOrder> getAmend_data() {
        return amend_data;
    }

    public void setAmend_data(List<AmendOrder> amend_data) {
        this.amend_data = amend_data;
    }

    private List<AmendOrder> amend_data;
}
