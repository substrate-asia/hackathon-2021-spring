package com.ares.runner;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

import org.apache.commons.compress.utils.Lists;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.w3c.dom.events.Event;

import com.alibaba.fastjson.JSONObject;
import com.ares.uitl.OkxeChannelEnum;
import com.ares.uitl.RedisUtils;
import com.huobi.client.MarketClient;
import com.huobi.client.req.market.SubMbpRefreshUpdateRequest;
import com.huobi.constant.HuobiOptions;
import com.huobi.constant.enums.DepthLevels;
import com.huobi.utils.SymbolUtils;
import com.okcoin.commons.okex.open.api.test.ws.swap.config.WebSocketClient;
import com.okcoin.commons.okex.open.api.test.ws.swap.config.WebSocketConfig;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class ApiRunner implements CommandLineRunner{

	@Value("${symbol}")
	private String symbol;

	@Autowired
	RedisUtils redisUtils;

    public static MarketClient huobimarketClient = MarketClient.create(new HuobiOptions());

    private static final WebSocketClient webSocketClient = new WebSocketClient();

    public void huobbct( String symbols) throws InterruptedException{
    	huobimarketClient.subMbpRefreshUpdate(SubMbpRefreshUpdateRequest.builder().symbols(symbols).levels(DepthLevels.LEVEL_5).build(), event -> {
           	   redisUtils.setCach(symbols, "huobi", event.getTopic(),event.getAsks().get(0).getPrice(),event.getTs());
        });
    }

	public void okexbtc(String symbols) throws InterruptedException {
		   //添加订阅频道
			 List<String> symbolList = SymbolUtils.parseSymbols(symbols);
	 		 ArrayList<String> channel = Lists.newArrayList();
	 		 for (String symbo : symbolList) {
	 			 channel.add("swap/ticker:"+OkxeChannelEnum.getValue(symbo));
			 }
		 	 WebSocketConfig.publicConnect(webSocketClient,e->{
		 		 String topic = OkxeChannelEnum.getKey(e.getString("instrument_id"));;
		 		 redisUtils.setCach(symbols, "okex",topic,e.getDouble("last"), getW3cTimeConvertString2Date(e.getString("timestamp"), "") );
		     });
		     //调用订阅方法
		     WebSocketClient.subscribe(channel);
		 }


	public static long getW3cTimeConvertString2Date(String date,String timeZone) {
			SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.CHINESE);
			Date parse;
			try {
				parse = format.parse(date);
				return parse.getTime();
			} catch (ParseException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
		}
			return 0;
		}

	@Override
	public void run(String... args) throws Exception {
		if(symbol.contains("huobi")){
			huobbct("btcusdt,ethusdt,dotusdt");
		}
		if(symbol.contains("okex")) {
			okexbtc("btcusdt,ethusdt,dotusdt");
		}
	}





}

