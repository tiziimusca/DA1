package com.example.auctionapp.controller;

import com.example.auctionapp.model.Catalogo;
import com.example.auctionapp.service.CatalogoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogos")
public class CatalogoController {

    private final CatalogoService catalogoService;

    public CatalogoController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    @GetMapping
    public List<Catalogo> listar() {
        return catalogoService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Catalogo> buscar(@PathVariable Integer id) {
        return catalogoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Catalogo crear(@Valid @RequestBody Catalogo catalogo) {
        return catalogoService.crear(catalogo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Catalogo> actualizar(@PathVariable Integer id,
            @Valid @RequestBody Catalogo catalogo) {
        try {
            Catalogo updated = catalogoService.actualizar(id, catalogo);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        catalogoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
