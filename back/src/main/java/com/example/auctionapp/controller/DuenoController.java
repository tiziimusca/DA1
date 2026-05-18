package com.example.auctionapp.controller;

import com.example.auctionapp.model.Dueno;
import com.example.auctionapp.service.DuenoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/duenos")
public class DuenoController {

    private final DuenoService duenoService;

    public DuenoController(DuenoService duenoService) {
        this.duenoService = duenoService;
    }

    @GetMapping
    public List<Dueno> listar() {
        return duenoService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dueno> buscar(@PathVariable Integer id) {
        return duenoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Dueno crear(@Valid @RequestBody Dueno dueno) {
        return duenoService.crear(dueno);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dueno> actualizar(@PathVariable Integer id,
            @Valid @RequestBody Dueno dueno) {
        try {
            Dueno updated = duenoService.actualizar(id, dueno);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        duenoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
