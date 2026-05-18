package com.example.auctionapp.controller;

import com.example.auctionapp.model.Asistente;
import com.example.auctionapp.service.AsistenteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asistentes")
public class AsistenteController {

    private final AsistenteService asistenteService;

    public AsistenteController(AsistenteService asistenteService) {
        this.asistenteService = asistenteService;
    }

    @GetMapping
    public List<Asistente> listar() {
        return asistenteService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asistente> buscar(@PathVariable Integer id) {
        return asistenteService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Asistente crear(@Valid @RequestBody Asistente asistente) {
        return asistenteService.crear(asistente);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asistente> actualizar(@PathVariable Integer id,
            @Valid @RequestBody Asistente asistente) {
        try {
            Asistente updated = asistenteService.actualizar(id, asistente);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        asistenteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
