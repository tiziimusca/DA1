package com.example.auctionapp.controller;

import com.example.auctionapp.dto.PaisDTO;
import com.example.auctionapp.model.Pais;
import com.example.auctionapp.service.PaisService;
import com.example.auctionapp.util.MapperUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/paises")
public class PaisController {

    private final PaisService paisService;

    public PaisController(PaisService paisService) {
        this.paisService = paisService;
    }

    @GetMapping
    public List<PaisDTO> listar() {
        return paisService.obtenerTodos().stream().map(MapperUtil::toPaisDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaisDTO> buscar(@PathVariable Integer id) {
        return paisService.obtenerPorId(id)
                .map(MapperUtil::toPaisDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public PaisDTO crear(@Valid @RequestBody PaisDTO paisDto) {
        Pais pais = MapperUtil.toPaisEntity(paisDto);
        return MapperUtil.toPaisDTO(paisService.crear(pais));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaisDTO> actualizar(@PathVariable Integer id, @Valid @RequestBody PaisDTO paisDto) {
        try {
            Pais pais = MapperUtil.toPaisEntity(paisDto);
            return ResponseEntity.ok(MapperUtil.toPaisDTO(paisService.actualizar(id, pais)));
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
