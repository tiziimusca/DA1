package com.example.auctionapp.controller;

import com.example.auctionapp.dto.*;
import com.example.auctionapp.dto.ErrorResponseDTO;
import com.example.auctionapp.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        try {
            LoginResponseDTO response = authService.autenticar(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping(value = "/registrar")
    public ResponseEntity<Object> registrarMultipart(
            @RequestParam("documento") String documento,
            @RequestParam("nombre") String nombre,
            @RequestParam("direccion") String direccion,
            @RequestParam("numeroPais") Integer numeroPais,
            @RequestParam("email") String email,
            @RequestParam("fotoDocumentoFrente") MultipartFile fotoDocumentoFrente,
            @RequestParam("fotoDocumentoDorso") MultipartFile fotoDocumentoDorso) {
        try {
            RegistroRequestDTO request = new RegistroRequestDTO();
            request.setDocumento(documento);
            request.setNombre(nombre);
            request.setDireccion(direccion);
            request.setNumeroPais(numeroPais);
            request.setEmail(email);
            request.setFotoDocumentoFrente(fotoDocumentoFrente.getBytes());
            request.setFotoDocumentoDorso(fotoDocumentoDorso.getBytes());

            RegistroResponseDTO response = authService.registrarUsuario(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            ErrorResponseDTO error = new ErrorResponseDTO("bad_request", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (IOException e) {
            ErrorResponseDTO error = new ErrorResponseDTO("bad_request",
                    "No se pudo procesar las fotos del documento.");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/solicitar-codigo")
    public ResponseEntity<Object> solicitarCodigo(@Valid @RequestBody SolicitarCodigoDTO request) {
        try {
            authService.enviarCodigoRecuperacion(request.getEmail());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            ErrorResponseDTO error = new ErrorResponseDTO("bad_request", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (IllegalStateException e) {
            ErrorResponseDTO error = new ErrorResponseDTO("too_many_requests", e.getMessage());
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(error);
        }
    }

    @PostMapping("/verificar-codigo")
    public ResponseEntity<Object> verificarCodigo(@Valid @RequestBody VerificarCodigoDTO request) {
        try {
            VerificarCodigoResponseDTO response = authService.validarCodigo(request.getCodigo());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ErrorResponseDTO error = new ErrorResponseDTO("bad_request", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/resetear-password")
    public ResponseEntity<Object> resetearPassword(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody ResetearPasswordDTO request) {
        try {
            authService.actualizarPassword(request, authorization);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            ErrorResponseDTO error = new ErrorResponseDTO("bad_request", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (SecurityException e) {
            ErrorResponseDTO error = new ErrorResponseDTO("unauthorized", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
}