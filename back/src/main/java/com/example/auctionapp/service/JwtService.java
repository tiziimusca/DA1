package com.example.auctionapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.Base64;
import java.util.HashMap;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service
public class JwtService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Pattern JSON_FIELD_PATTERN = Pattern
            .compile("\\\"([^\\\"]+)\\\"\\s*:\\s*(\\\"([^\\\"]*)\\\"|\\d+)");

    @Value("${app.jwt.secret:change-me-in-production}")
    private String secret;

    @Value("${app.jwt.reset-token-ttl-minutes:15}")
    private long resetTokenTtlMinutes;

    @Value("${app.jwt.auth-token-ttl-minutes:480}")
    private long authTokenTtlMinutes;

    private final Set<String> usedResetTokenIds = ConcurrentHashMap.newKeySet();

    public String generarTokenReseteo(String email) {
        return crearToken(email, "password_reset", resetTokenTtlMinutes);
    }

    public String generarTokenAutenticacion(String email) {
        return crearToken(email, "auth", authTokenTtlMinutes);
    }

    public String validarTokenAutenticacion(String token) {
        return validarTokenConPurpose(token, "auth");
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
            mac.init(secretKeySpec);
            byte[] rawSignature = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return base64Url(rawSignature);
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo firmar el token de reseteo", ex);
        }
    }

    private String base64Url(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private String randomNonce() {
        byte[] bytes = new byte[16];
        RANDOM.nextBytes(bytes);
        return base64Url(bytes);
    }

    private String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    public boolean isTokenSignatureValid(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return false;
        }

        String expectedSignature = sign(parts[0] + "." + parts[1]);
        return MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8),
                parts[2].getBytes(StandardCharsets.UTF_8));
    }

    public String validarTokenReseteo(String token) {
        String subject = validarTokenConPurpose(token, "password_reset");
        Map<String, String> claims = parsePayload(token);
        String jti = claims.get("jti");
        if (jti == null || jti.isBlank()) {
            throw new SecurityException("Token de reseteo inválido");
        }
        if (usedResetTokenIds.contains(jti)) {
            throw new SecurityException("Token de reseteo ya usado");
        }
        return subject;
    }

    public void marcarTokenReseteoUsado(String token) {
        Map<String, String> claims = parsePayload(token);
        String jti = claims.get("jti");
        if (jti != null && !jti.isBlank()) {
            usedResetTokenIds.add(jti);
        }
    }

    public String extraerToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return null;
        }

        String prefix = "Bearer ";
        if (!authorizationHeader.regionMatches(true, 0, prefix, 0, prefix.length())) {
            throw new SecurityException("Cabecera Authorization inválida");
        }

        return authorizationHeader.substring(prefix.length()).trim();
    }

    private Map<String, String> parsePayload(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new SecurityException("Token de reseteo inválido");
        }

        try {
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            Map<String, String> claims = new HashMap<>();
            Matcher matcher = JSON_FIELD_PATTERN.matcher(payloadJson);
            while (matcher.find()) {
                String key = matcher.group(1);
                String value = matcher.group(3) != null ? matcher.group(3) : matcher.group(2);
                if (value != null && value.startsWith("\"") && value.endsWith("\"")) {
                    value = value.substring(1, value.length() - 1);
                }
                claims.put(key, value);
            }
            return claims;
        } catch (IllegalArgumentException ex) {
            throw new SecurityException("Token de reseteo inválido", ex);
        }
    }

    private String crearToken(String email, String purpose, long ttlMinutes) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email inválido para generar token");
        }

        long issuedAt = Instant.now().getEpochSecond();
        long expiresAt = Instant.now().plusSeconds(ttlMinutes * 60).getEpochSecond();
        String nonce = randomNonce();

        String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payloadJson = String.format(
                "{\"sub\":\"%s\",\"purpose\":\"%s\",\"iat\":%d,\"exp\":%d,\"jti\":\"%s\"}",
                escapeJson(email), purpose, issuedAt, expiresAt, nonce);

        String header = base64Url(headerJson.getBytes(StandardCharsets.UTF_8));
        String payload = base64Url(payloadJson.getBytes(StandardCharsets.UTF_8));
        String signature = sign(header + "." + payload);
        return header + "." + payload + "." + signature;
    }

    private String validarTokenConPurpose(String token, String expectedPurpose) {
        if (!isTokenSignatureValid(token)) {
            throw new SecurityException("Token inválido");
        }

        Map<String, String> claims = parsePayload(token);
        String purpose = claims.get("purpose");
        if (!expectedPurpose.equals(purpose)) {
            throw new SecurityException("Token inválido");
        }

        String subject = claims.get("sub");
        String expValue = claims.get("exp");

        if (subject == null || subject.isBlank() || expValue == null) {
            throw new SecurityException("Token inválido");
        }

        long expiresAt;
        try {
            expiresAt = Long.parseLong(expValue);
        } catch (NumberFormatException ex) {
            throw new SecurityException("Token inválido", ex);
        }

        long now = Instant.now().getEpochSecond();
        if (now > expiresAt) {
            throw new SecurityException("Token expirado");
        }

        return subject;
    }
}
