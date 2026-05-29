package com.example.auctionapp.controller;

import com.example.auctionapp.dto.ActualizarPerfilClienteRequestDTO;
import com.example.auctionapp.dto.ErrorResponseDTO;
import com.example.auctionapp.dto.PerfilClienteResponseDTO;
import com.example.auctionapp.model.Cliente;
import com.example.auctionapp.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public List<Cliente> listar() {
        return clienteService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscar(@PathVariable Integer id) {
        return clienteService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Cliente crear(@Valid @RequestBody Cliente cliente) {
        return clienteService.crear(cliente);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> actualizar(@PathVariable Integer id,
            @Valid @RequestBody Cliente cliente) {
        try {
            Cliente updated = clienteService.actualizar(id, cliente);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        clienteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/perfil")
    public ResponseEntity<Object> obtenerPerfil(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            PerfilClienteResponseDTO response = clienteService.obtenerPerfil(authorizationHeader);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            ErrorResponseDTO error = new ErrorResponseDTO("unauthorized", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PutMapping("/perfil")
    public ResponseEntity<Object> actualizarPerfil(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody ActualizarPerfilClienteRequestDTO request) {
        try {
            PerfilClienteResponseDTO response = clienteService.actualizarPerfil(authorizationHeader, request);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            ErrorResponseDTO error = new ErrorResponseDTO("unauthorized", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (IllegalArgumentException e) {
            ErrorResponseDTO error = new ErrorResponseDTO("bad_request", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
