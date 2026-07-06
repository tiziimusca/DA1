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

    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        log.info("[WS CONNECTED] Session ID: {} (Total active: {})", session.getId(), sessions.size());
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        String payload = message.getPayload();
        if ("ping".equalsIgnoreCase(payload)) {
            try {
                session.sendMessage(new TextMessage("pong"));
            } catch (IOException e) {
                log.warn("Fallo al responder ping para {}: {}", session.getId(), e.getMessage());
            }
            return;
        }
        for (WebSocketSession target : sessions) {
            if (target.isOpen()) {
                try {
                    target.sendMessage(new TextMessage(payload));
                } catch (IOException e) {
                    log.warn("Fallo {}: {}", target.getId(), e.getMessage());
                    safeCloseAndRemove(target);
                } catch (Exception e) {
                    log.warn("Fallo inesperado {}: {}", target.getId(), e.getMessage());
                }
            }
        }
    }

    public void broadcast(String message) {
        log.info("[WS BROADCAST] Broadcasting to {} sessions: {}", sessions.size(), message);
        for (WebSocketSession target : sessions) {
            if (target.isOpen()) {
                try {
                    target.sendMessage(new TextMessage(message));
                } catch (IOException e) {
                    log.warn("Fallo {}: {}", target.getId(), e.getMessage());
                    safeCloseAndRemove(target);
                } catch (Exception e) {
                    log.warn("Fallo inesperado {}: {}", target.getId(), e.getMessage());
                }
            }
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.warn("Error de transporte {}: {}", session.getId(), exception.getMessage());
        safeCloseAndRemove(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        log.info("[WS CLOSED] Session ID: {} (status={}, Remaining active: {})", session.getId(), status, sessions.size());
    }

    private void safeCloseAndRemove(WebSocketSession session) {
        try {
            if (session.isOpen()) {
                session.close(CloseStatus.SERVER_ERROR);
            }
        } catch (Exception e) {
            log.debug("Error {}: {}", session.getId(), e.getMessage());
        } finally {
            sessions.remove(session);
        }
    }
}
