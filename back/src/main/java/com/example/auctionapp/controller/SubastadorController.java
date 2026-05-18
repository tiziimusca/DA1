package com.example.auctionapp.controller;

import com.example.auctionapp.model.Subastador;
import com.example.auctionapp.service.SubastadorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subastadores")
public class SubastadorController {

    private final SubastadorService subastadorService;

    public SubastadorController(SubastadorService subastadorService) {
        this.subastadorService = subastadorService;
    }

    @GetMapping
    public List<Subastador> listar() {
        return subastadorService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subastador> buscar(@PathVariable Integer id) {
        return subastadorService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Subastador crear(@Valid @RequestBody Subastador subastador) {
        return subastadorService.crear(subastador);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subastador> actualizar(@PathVariable Integer id,
            @Valid @RequestBody Subastador subastador) {
        try {
            Subastador updated = subastadorService.actualizar(id, subastador);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        subastadorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
