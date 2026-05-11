package com.example.auctionapp.service;

import com.example.auctionapp.model.Persona;
import com.example.auctionapp.repository.PersonaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PersonaService {

    private final PersonaRepository personaRepository;

    public PersonaService(PersonaRepository personaRepository) {
        this.personaRepository = personaRepository;
    }

    public List<Persona> obtenerTodas() {
        return personaRepository.findAll();
    }

    public Optional<Persona> obtenerPorId(Integer id) {
        return personaRepository.findById(id);
    }

    public Persona crear(Persona persona) {
        if (persona.getEstado() == null) {
            persona.setEstado("activo");
        }
        return personaRepository.save(persona);
    }

    public Persona actualizar(Integer id, Persona persona) {
        return personaRepository.findById(id)
                .map(existing -> {
                    existing.setDocumento(persona.getDocumento());
                    existing.setNombre(persona.getNombre());
                    existing.setDireccion(persona.getDireccion());
                    existing.setEstado(persona.getEstado());
                    existing.setFoto(persona.getFoto());
                    return personaRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Persona no encontrada"));
    }

    public void eliminar(Integer id) {
        personaRepository.deleteById(id);
    }
}
