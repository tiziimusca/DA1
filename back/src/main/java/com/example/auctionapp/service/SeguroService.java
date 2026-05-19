package com.example.auctionapp.service;

import com.example.auctionapp.model.Seguro;
import com.example.auctionapp.repository.SeguroRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SeguroService {

    private final SeguroRepository seguroRepository;

    public SeguroService(SeguroRepository seguroRepository) {
        this.seguroRepository = seguroRepository;
    }

    public List<Seguro> obtenerTodos() {
        return seguroRepository.findAll();
    }

    public Optional<Seguro> obtenerPorId(Integer id) {
        return seguroRepository.findById(id);
    }

    public Seguro crear(Seguro seguro) {
        return seguroRepository.save(seguro);
    }

    public Seguro actualizar(Integer id, Seguro seguro) {
        return seguroRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(seguro, existing, "identificador");
                    return seguroRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Seguro no encontrado"));
    }

    public void eliminar(Integer id) {
        seguroRepository.deleteById(id);
    }
}
