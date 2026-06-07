package com.example.auctionapp.controller;

import com.example.auctionapp.model.Seguro;
import com.example.auctionapp.service.SeguroService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seguros")
public class SeguroController {

    private final SeguroService seguroService;

    public SeguroController(SeguroService seguroService) {
        this.seguroService = seguroService;
    }

    @GetMapping
    public List<Seguro> listar() {
        return seguroService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Seguro> buscar(@PathVariable String id) {
        return seguroService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Seguro crear(@Valid @RequestBody Seguro seguro) {
        return seguroService.crear(seguro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Seguro> actualizar(@PathVariable String id,
            @Valid @RequestBody Seguro seguro) {
        try {
            Seguro updated = seguroService.actualizar(id, seguro);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        seguroService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
