package com.example.auctionapp.service;

import com.example.auctionapp.model.Dueno;
import com.example.auctionapp.repository.DuenoRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DuenoService {

    private final DuenoRepository duenoRepository;

    public DuenoService(DuenoRepository duenoRepository) {
        this.duenoRepository = duenoRepository;
    }

    public List<Dueno> obtenerTodos() {
        return duenoRepository.findAll();
    }

    public Optional<Dueno> obtenerPorId(Integer id) {
        return duenoRepository.findById(id);
    }

    public Dueno crear(Dueno dueno) {
        return duenoRepository.save(dueno);
    }

    public Dueno actualizar(Integer id, Dueno dueno) {
        return duenoRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(dueno, existing, "identificador");
                    return duenoRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Dueno no encontrado"));
    }

    public void eliminar(Integer id) {
        duenoRepository.deleteById(id);
    }
}
