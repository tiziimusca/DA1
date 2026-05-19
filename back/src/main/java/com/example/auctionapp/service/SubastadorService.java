package com.example.auctionapp.service;

import com.example.auctionapp.model.Subastador;
import com.example.auctionapp.repository.SubastadorRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SubastadorService {

    private final SubastadorRepository subastadorRepository;

    public SubastadorService(SubastadorRepository subastadorRepository) {
        this.subastadorRepository = subastadorRepository;
    }

    public List<Subastador> obtenerTodos() {
        return subastadorRepository.findAll();
    }

    public Optional<Subastador> obtenerPorId(Integer id) {
        return subastadorRepository.findById(id);
    }

    public Subastador crear(Subastador subastador) {
        return subastadorRepository.save(subastador);
    }

    public Subastador actualizar(Integer id, Subastador subastador) {
        return subastadorRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(subastador, existing, "identificador");
                    return subastadorRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Subastador no encontrado"));
    }

    public void eliminar(Integer id) {
        subastadorRepository.deleteById(id);
    }
}
