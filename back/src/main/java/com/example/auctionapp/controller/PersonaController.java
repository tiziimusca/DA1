package com.example.auctionapp.controller;

import com.example.auctionapp.model.Persona;
import com.example.auctionapp.service.PersonaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/personas")
public class PersonaController {

    private final PersonaRepository personaRepository;

    public PersonaController(PersonaService personaService) {
        this.personaService = personaService;
    }

    @GetMapping
    public List<Persona> listar() {
        return personaService.obtenerTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Persona> buscar(@PathVariable Integer id) {
        return personaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Persona crear(@RequestBody Persona persona) {
        return personaService.crear(persona);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Persona> actualizar(@PathVariable Integer id, @RequestBody Persona persona) {
        try {
            return ResponseEntity.ok(personaService.actualizar(id, persona));
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
