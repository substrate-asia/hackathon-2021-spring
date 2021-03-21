package com.ares.uitl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import com.alibaba.fastjson.JSONObject;
import com.ares.model.PriceModel;
import com.huobi.utils.SymbolUtils;

@Component
public class RedisUtils {

	@Autowired
	RedisTemplate<String,String> redis;

	public void setCach(String symbols,String market,String topic,double price,Long ts){
		List<String> symbolList = SymbolUtils.parseSymbols(symbols);
		symbolList.stream().forEach(e->{
			if(topic.contains(e)) {
				redis.opsForHash().put(e,market, JSONObject.toJSONString(new PriceModel(market, e, price,ts)));
			}
		});
	}


	public Map<Object, Object> getCach(String symbol){
			return redis.opsForHash().entries(symbol);
	}


	public Object getCach(String symbol,String market){
		return redis.opsForHash().get(symbol, market);
}

}
