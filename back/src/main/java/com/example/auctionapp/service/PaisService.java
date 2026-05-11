package com.example.auctionapp.service;

import com.example.auctionapp.model.Pais;
import com.example.auctionapp.repository.PaisRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PaisService {

    private final PaisRepository paisRepository;

    public PaisService(PaisRepository paisRepository) {
        this.paisRepository = paisRepository;
    }

    public List<Pais> obtenerTodos() {
        return paisRepository.findAll();
    }

    public Optional<Pais> obtenerPorId(Integer id) {
        return paisRepository.findById(id);
    }

    public Pais crear(Pais pais) {
        return paisRepository.save(pais);
    }

    public Pais actualizar(Integer id, Pais pais) {
        return paisRepository.findById(id)
                .map(existing -> {
                    existing.setNombre(pais.getNombre());
                    existing.setNombreCorto(pais.getNombreCorto());
                    existing.setCapital(pais.getCapital());
                    existing.setNacionalidad(pais.getNacionalidad());
                    existing.setIdiomas(pais.getIdiomas());
                    return paisRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Pais no encontrado"));
    }

    public void eliminar(Integer id) {
        paisRepository.deleteById(id);
    }
}
