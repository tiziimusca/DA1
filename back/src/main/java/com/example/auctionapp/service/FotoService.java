package com.example.auctionapp.service;

import com.example.auctionapp.model.Foto;
import com.example.auctionapp.repository.FotoRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FotoService {

    private final FotoRepository fotoRepository;

    public FotoService(FotoRepository fotoRepository) {
        this.fotoRepository = fotoRepository;
    }

    public List<Foto> obtenerTodos() {
        return fotoRepository.findAll();
    }

    public Optional<Foto> obtenerPorId(Integer id) {
        return fotoRepository.findById(id);
    }

    public Foto crear(Foto foto) {
        return fotoRepository.save(foto);
    }

    public Foto actualizar(Integer id, Foto foto) {
        return fotoRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(foto, existing, "identificador");
                    return fotoRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Foto no encontrada"));
    }

    public void eliminar(Integer id) {
        fotoRepository.deleteById(id);
    }
}
