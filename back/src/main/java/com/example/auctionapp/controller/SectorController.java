package com.example.auctionapp.controller;

import com.example.auctionapp.model.Sector;
import com.example.auctionapp.service.SectorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sectores")
public class SectorController {

    private final SectorService sectorService;

    public SectorController(SectorService sectorService) {
        this.sectorService = sectorService;
    }

    @GetMapping
    public List<Sector> listar() {
        return sectorService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sector> buscar(@PathVariable Integer id) {
        return sectorService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Sector crear(@Valid @RequestBody Sector sector) {
        return sectorService.crear(sector);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sector> actualizar(@PathVariable Integer id,
            @Valid @RequestBody Sector sector) {
        try {
            Sector updated = sectorService.actualizar(id, sector);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        sectorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
