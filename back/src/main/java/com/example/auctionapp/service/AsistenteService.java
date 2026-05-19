package com.example.auctionapp.service;

import com.example.auctionapp.model.Asistente;
import com.example.auctionapp.repository.AsistenteRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AsistenteService {

    private final AsistenteRepository asistenteRepository;

    public AsistenteService(AsistenteRepository asistenteRepository) {
        this.asistenteRepository = asistenteRepository;
    }

    public List<Asistente> obtenerTodos() {
        return asistenteRepository.findAll();
    }

    public Optional<Asistente> obtenerPorId(Integer id) {
        return asistenteRepository.findById(id);
    }

    public Asistente crear(Asistente asistente) {
        return asistenteRepository.save(asistente);
    }

    public Asistente actualizar(Integer id, Asistente asistente) {
        return asistenteRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(asistente, existing, "identificador");
                    return asistenteRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Asistente no encontrado"));
    }

    public void eliminar(Integer id) {
        asistenteRepository.deleteById(id);
    }
}
