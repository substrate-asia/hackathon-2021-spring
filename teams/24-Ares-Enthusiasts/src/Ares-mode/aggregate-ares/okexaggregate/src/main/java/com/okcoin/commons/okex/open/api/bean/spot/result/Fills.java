package com.okcoin.commons.okex.open.api.bean.spot.result;

public class Fills {

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }


    public String getLedger_id() {
        return ledger_id;
    }

    public void setLedger_id(String ledger_id) {
        this.ledger_id = ledger_id;
    }

    // 账单 id
    private String ledger_id;
    private String trade_id;
    // 币种 id
    private String instrument_id;
    // 价格
    private String price;
    // 数量
    private String size;
    // 订单 id
    private Long order_id;
    // 创建时间
    private String timestamp;

    private String exec_type;
    // 手续费
    private String fee;
    // buy、sell
    private String side;
    private String currency;



    public String getExec_type() {
        return exec_type;
    }

    public void setExec_type(String exec_type) {
        this.exec_type = exec_type;
    }

    public String getFee() {
        return fee;
    }

    public void setFee(String fee) {
        this.fee = fee;
    }

    public String getSide() {
        return side;
    }

    public void setSide(String side) {
        this.side = side;
    }



    public String getTrade_id() {
        return trade_id;
    }

    public void setTrade_id(String trade_id) {
        this.trade_id = trade_id;
    }


    public String getInstrument_id() {
        return this.instrument_id;
    }

    public void setInstrument_id(final String instrument_id) {
        this.instrument_id = instrument_id;
    }


    public String getPrice() {
        return this.price;
    }

    public void setPrice(final String price) {
        this.price = price;
    }

    public String getSize() {
        return this.size;
    }

    public void setSize(final String size) {
        this.size = size;
    }

    public Long getOrder_id() {
        return this.order_id;
    }

    public void setOrder_id(final Long order_id) {
        this.order_id = order_id;
    }

    public String getTimestamp() {
        return this.timestamp;
    }

    public void setTimestamp(final String timestamp) {
        this.timestamp = timestamp;
    }


}
