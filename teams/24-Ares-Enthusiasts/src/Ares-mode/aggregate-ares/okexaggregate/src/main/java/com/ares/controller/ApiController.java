package com.ares.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONObject;
import com.ares.model.PriceModel;
import com.ares.uitl.R;
import com.ares.uitl.RedisUtils;




@RestController
@RequestMapping("/api")
public class ApiController {

	@Autowired
	RedisUtils redisUtils;

	@RequestMapping("getprice/{symbol}")
	private R getprice(@PathVariable("symbol") String symbol) {
		return R.ok().put("data", redisUtils.getCach(symbol));
	}

	@RequestMapping("getprice/{symbol}/{market}")
	private R getprice(@PathVariable("symbol") String symbol,@PathVariable("market") String market) {
		return R.ok().put("data", JSONObject.parseObject(redisUtils.getCach(symbol,market)+""));
	}

	/**
	 *
	 * @param symbol
	 * @return party price ...
	 */
	@RequestMapping("getPartyPrice/{symbol}")
	private R getPartyPrice(@PathVariable("symbol") String symbol) {
		Map<Object, Object> cach = redisUtils.getCach(symbol);
		double price=0;
		for (Object iterable_element : cach.keySet()) {
			 Object object = cach.get(iterable_element);
			 PriceModel priceModel = JSONObject.parseObject(""+object,PriceModel.class );
			 price+=priceModel.getPrice();
		}
		price =price/cach.size();
		return R.ok().put("data",new PriceModel(symbol, price));
	}





}
