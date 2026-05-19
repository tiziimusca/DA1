package com.example.auctionapp.service;

import com.example.auctionapp.model.Sector;
import com.example.auctionapp.repository.SectorRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SectorService {

    private final SectorRepository sectorRepository;

    public SectorService(SectorRepository sectorRepository) {
        this.sectorRepository = sectorRepository;
    }

    public List<Sector> obtenerTodos() {
        return sectorRepository.findAll();
    }

    public Optional<Sector> obtenerPorId(Integer id) {
        return sectorRepository.findById(id);
    }

    public Sector crear(Sector sector) {
        return sectorRepository.save(sector);
    }

    public Sector actualizar(Integer id, Sector sector) {
        return sectorRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(sector, existing, "identificador");
                    return sectorRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Sector no encontrado"));
    }

    public void eliminar(Integer id) {
        sectorRepository.deleteById(id);
    }
}
