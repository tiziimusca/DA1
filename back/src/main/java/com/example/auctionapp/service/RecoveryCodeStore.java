package com.example.auctionapp.service;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RecoveryCodeStore {

    private static class RecoveryCodeEntry {
        private final String email;
        private final Instant expiresAt;

        private RecoveryCodeEntry(String email, Instant expiresAt) {
            this.email = email;
            this.expiresAt = expiresAt;
        }
    }

    private final ConcurrentHashMap<String, RecoveryCodeEntry> entriesByCode = new ConcurrentHashMap<>();

    public void save(String email, String code, Duration ttl) {
        Instant expiresAt = Instant.now().plus(ttl);
        entriesByCode.put(code.toUpperCase(), new RecoveryCodeEntry(email, expiresAt));
    }

    public String consumeValidCode(String code) {
        if (code == null) {
            throw new IllegalArgumentException("Código incorrecto o expirado");
        }
        RecoveryCodeEntry entry = entriesByCode.remove(code.toUpperCase());
        if (entry == null) {
            throw new IllegalArgumentException("Código incorrecto o expirado");
        }

        if (Instant.now().isAfter(entry.expiresAt)) {
            throw new IllegalArgumentException("Código incorrecto o expirado");
        }

        return entry.email;
    }

    public void clearByEmail(String email) {
        entriesByCode.entrySet().removeIf(entry -> entry.getValue().email.equalsIgnoreCase(email));
    }
}
