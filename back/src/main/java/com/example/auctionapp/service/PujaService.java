package com.example.auctionapp.service;

import com.example.auctionapp.model.Puja;
import com.example.auctionapp.repository.PujaRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PujaService {

    private final PujaRepository pujaRepository;

    public PujaService(PujaRepository pujaRepository) {
        this.pujaRepository = pujaRepository;
    }

    public List<Puja> obtenerTodos() {
        return pujaRepository.findAll();
    }

    public Optional<Puja> obtenerPorId(Integer id) {
        return pujaRepository.findById(id);
    }

    public Optional<Puja> obtenerMejorPujaPorItem(Integer itemId) {
        return pujaRepository.findTopByItem_IdentificadorOrderByImporteDesc(itemId);
    }

    public Puja crear(Puja puja) {
        return pujaRepository.save(puja);
    }

    public Puja actualizar(Integer id, Puja puja) {
        return pujaRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(puja, existing, "identificador");
                    return pujaRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Puja no encontrada"));
    }

    public void eliminar(Integer id) {
        pujaRepository.deleteById(id);
    }
}
