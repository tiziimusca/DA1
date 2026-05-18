package com.example.auctionapp.controller;

import com.example.auctionapp.model.RegistroDeSubasta;
import com.example.auctionapp.service.RegistroDeSubastaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registros-subasta")
public class RegistroDeSubastaController {

    private final RegistroDeSubastaService registroDeSubastaService;

    public RegistroDeSubastaController(RegistroDeSubastaService registroDeSubastaService) {
        this.registroDeSubastaService = registroDeSubastaService;
    }

    @GetMapping
    public List<RegistroDeSubasta> listar() {
        return registroDeSubastaService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistroDeSubasta> buscar(@PathVariable Integer id) {
        return registroDeSubastaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public RegistroDeSubasta crear(@Valid @RequestBody RegistroDeSubasta registroDeSubasta) {
        return registroDeSubastaService.crear(registroDeSubasta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RegistroDeSubasta> actualizar(@PathVariable Integer id,
            @Valid @RequestBody RegistroDeSubasta registroDeSubasta) {
        try {
            RegistroDeSubasta updated = registroDeSubastaService.actualizar(id, registroDeSubasta);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        registroDeSubastaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
