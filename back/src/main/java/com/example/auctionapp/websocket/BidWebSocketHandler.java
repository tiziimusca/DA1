package com.example.auctionapp.websocket;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class BidWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(BidWebSocketHandler.class);

    // concurrent set allows safe iteration without external synchronization
    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        log.debug("WebSocket connected: {} (total={})", session.getId(), sessions.size());
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        String payload = message.getPayload();
        // iterate over a concurrent set; avoid throwing on one failure
        for (WebSocketSession target : sessions) {
            if (target.isOpen()) {
                try {
                    target.sendMessage(new TextMessage(payload));
                } catch (IOException e) {
                    log.warn("Failed to send message to session {}: {}", target.getId(), e.getMessage());
                    // try to close and remove faulty session
                    safeCloseAndRemove(target);
                } catch (Exception e) {
                    log.warn("Unexpected error sending websocket message to {}: {}", target.getId(), e.getMessage());
                }
            }
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.warn("Transport error on session {}: {}", session.getId(), exception.getMessage());
        safeCloseAndRemove(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        log.debug("WebSocket closed: {} (status={}), remaining={} ", session.getId(), status, sessions.size());
    }

    private void safeCloseAndRemove(WebSocketSession session) {
        try {
            if (session.isOpen()) {
                session.close(CloseStatus.SERVER_ERROR);
            }
        } catch (Exception e) {
            log.debug("Error while closing session {}: {}", session.getId(), e.getMessage());
        } finally {
            sessions.remove(session);
        }
    }
}
