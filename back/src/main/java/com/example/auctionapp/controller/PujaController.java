package com.example.auctionapp.controller;

import com.example.auctionapp.model.Puja;
import com.example.auctionapp.service.PujaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pujas")
public class PujaController {

    private final PujaService pujaService;

    public PujaController(PujaService pujaService) {
        this.pujaService = pujaService;
    }

    @GetMapping
    public List<Puja> listar() {
        return pujaService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Puja> buscar(@PathVariable Integer id) {
        return pujaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Puja crear(@Valid @RequestBody Puja puja) {
        return pujaService.crear(puja);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Puja> actualizar(@PathVariable Integer id,
            @Valid @RequestBody Puja puja) {
        try {
            Puja updated = pujaService.actualizar(id, puja);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        pujaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
