package com.example.auctionapp.service;

import com.example.auctionapp.model.RegistroDeSubasta;
import com.example.auctionapp.repository.RegistroDeSubastaRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RegistroDeSubastaService {

    private final RegistroDeSubastaRepository registroRepository;

    public RegistroDeSubastaService(RegistroDeSubastaRepository registroRepository) {
        this.registroRepository = registroRepository;
    }

    public List<RegistroDeSubasta> obtenerTodos() {
        return registroRepository.findAll();
    }

    public Optional<RegistroDeSubasta> obtenerPorId(Integer id) {
        return registroRepository.findById(id);
    }

    public RegistroDeSubasta crear(RegistroDeSubasta registro) {
        return registroRepository.save(registro);
    }

    public RegistroDeSubasta actualizar(Integer id, RegistroDeSubasta registro) {
        return registroRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(registro, existing, "identificador");
                    return registroRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("RegistroDeSubasta no encontrado"));
    }

    public void eliminar(Integer id) {
        registroRepository.deleteById(id);
    }
}
