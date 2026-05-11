package com.example.auctionapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.example.auctionapp.websocket.BidWebSocketHandler;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final BidWebSocketHandler bidWebSocketHandler;

    public WebSocketConfig(BidWebSocketHandler bidWebSocketHandler) {
        this.bidWebSocketHandler = bidWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(bidWebSocketHandler, "/ws/bids")
                .setAllowedOrigins("*");
    }
}
