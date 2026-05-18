package com.example.auctionapp.controller;

import com.example.auctionapp.model.Foto;
import com.example.auctionapp.service.FotoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fotos")
public class FotoController {

    private final FotoService fotoService;

    public FotoController(FotoService fotoService) {
        this.fotoService = fotoService;
    }

    @GetMapping
    public List<Foto> listar() {
        return fotoService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Foto> buscar(@PathVariable Integer id) {
        return fotoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Foto crear(@Valid @RequestBody Foto foto) {
        return fotoService.crear(foto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Foto> actualizar(@PathVariable Integer id,
            @Valid @RequestBody Foto foto) {
        try {
            Foto updated = fotoService.actualizar(id, foto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        fotoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
