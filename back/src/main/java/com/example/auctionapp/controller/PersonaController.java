package com.example.auctionapp.controller;

import com.example.auctionapp.model.Persona;
import com.example.auctionapp.service.PersonaService;
import com.example.auctionapp.dto.PersonaDTO;
import com.example.auctionapp.util.MapperUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/personas")
public class PersonaController {

    private final PersonaService personaService;

    public PersonaController(PersonaService personaService) {
        this.personaService = personaService;
    }

    @GetMapping
    public List<PersonaDTO> listar() {
        return personaService.obtenerTodas()
                .stream()
                .map(MapperUtil::toPersonaDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonaDTO> buscar(@PathVariable Integer id) {
        return personaService.obtenerPorId(id)
                .map(MapperUtil::toPersonaDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public PersonaDTO crear(@Valid @RequestBody PersonaDTO personaDto) {
        Persona p = MapperUtil.toPersonaEntity(personaDto);
        Persona saved = personaService.crear(p);
        return MapperUtil.toPersonaDTO(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonaDTO> actualizar(@PathVariable Integer id, @Valid @RequestBody PersonaDTO personaDto) {
        try {
            Persona p = MapperUtil.toPersonaEntity(personaDto);
            Persona updated = personaService.actualizar(id, p);
            return ResponseEntity.ok(MapperUtil.toPersonaDTO(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        personaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
