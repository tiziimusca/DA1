package com.example.auctionapp.controller;

import com.example.auctionapp.dto.*;
import com.example.auctionapp.dto.ErrorResponseDTO;
import com.example.auctionapp.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        try {
            LoginResponseDTO response = authService.autenticar(request);
            return ResponseEntity.ok(response); // 200 OK
        } catch (IllegalArgumentException e) {
            // Ejemplo: Credenciales incorrectas o cuenta inactiva
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401 Unauthorized
        }
    }

    @PostMapping("/registrar")
    public ResponseEntity<Object> registrar(@Valid @RequestBody RegistroRequestDTO request) {
        try {
            RegistroResponseDTO response = authService.registrarUsuario(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response); // 201 Created
        } catch (IllegalArgumentException e) {
            // Retornamos un JSON con código y mensaje para facilitar el manejo en el front
            ErrorResponseDTO error = new ErrorResponseDTO("bad_request", e.getMessage());
            return ResponseEntity.badRequest().body(error); // 400 Bad Request
        }
    }

    @PostMapping("/solicitar-codigo")
    public ResponseEntity<Object> solicitarCodigo(@Valid @RequestBody SolicitarCodigoDTO request) {
        try {
            authService.enviarCodigoRecuperacion(request.getEmail());
            return ResponseEntity.ok().build(); // 200 OK
        } catch (IllegalArgumentException e) {
            ErrorResponseDTO error = new ErrorResponseDTO("bad_request", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (IllegalStateException e) {
            // Ejemplo: Demasiados intentos
            ErrorResponseDTO error = new ErrorResponseDTO("too_many_requests", e.getMessage());
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(error); // 429 Too Many Requests
        }
    }

    @PostMapping("/verificar-codigo")
    public ResponseEntity<VerificarCodigoResponseDTO> verificarCodigo(@Valid @RequestBody VerificarCodigoDTO request) {
        try {
            VerificarCodigoResponseDTO response = authService.validarCodigo(request.getCodigo());
            return ResponseEntity.ok(response); // 200 OK
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build(); // 400 Bad Request
        }
    }

    @PostMapping("/resetear-password")
    public ResponseEntity<Object> resetearPassword(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody ResetearPasswordDTO request) {
        try {
            authService.actualizarPassword(request, authorization);
            return ResponseEntity.ok().build(); // 200 OK
        } catch (IllegalArgumentException e) {
            ErrorResponseDTO error = new ErrorResponseDTO("bad_request", e.getMessage());
            return ResponseEntity.badRequest().body(error); // 400 Bad Request
        } catch (SecurityException e) {
            ErrorResponseDTO error = new ErrorResponseDTO("unauthorized", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error); // 401 Unauthorized
        }
    }
}