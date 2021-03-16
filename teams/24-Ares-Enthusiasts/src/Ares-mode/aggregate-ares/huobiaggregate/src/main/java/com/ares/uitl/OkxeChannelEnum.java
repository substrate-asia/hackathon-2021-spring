package com.ares.uitl;

/**
 *  
 * @author daitao
 *
 */
public enum OkxeChannelEnum {
	btcusdt("btcusdt","BTC-USD-SWAP"),
	ethusdt("ethusdt","ETH-USD-SWAP"),
	dotusdt("dotusdt","DOT-USD-SWAP");
	private String key;
	private String value;
	
	OkxeChannelEnum(String key,String value){
		this.key=key;
		this.value=value;
	}
	
	public static String getValue(String key) {
		OkxeChannelEnum[] values = OkxeChannelEnum.values();
		for (OkxeChannelEnum okxeChannelEnum : values) {
			if(okxeChannelEnum.getKey().equals(key)) {
				return okxeChannelEnum.getValue();
			}
		}
		return null;
	}
	
	public static String getKey(String value) {
		OkxeChannelEnum[] values = OkxeChannelEnum.values();
		for (OkxeChannelEnum okxeChannelEnum : values) {
			if(okxeChannelEnum.getValue().equals(value)) {
				return okxeChannelEnum.getKey();
			}
		}
		return null;
	}
	

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}
	
	
}
