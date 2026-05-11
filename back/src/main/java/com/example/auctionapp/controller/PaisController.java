package com.example.auctionapp.controller;

import com.example.auctionapp.model.Pais;
import com.example.auctionapp.service.PaisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paises")
public class PaisController {

    private final PaisService paisService;

    public PaisController(PaisService paisService) {
        this.paisService = paisService;
    }

    @GetMapping
    public List<Pais> listar() {
        return paisService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pais> buscar(@PathVariable Integer id) {
        return paisService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Pais crear(@RequestBody Pais pais) {
        return paisService.crear(pais);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pais> actualizar(@PathVariable Integer id, @RequestBody Pais pais) {
        try {
            return ResponseEntity.ok(paisService.actualizar(id, pais));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        paisService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
