package com.example.auctionapp.repository;

import com.example.auctionapp.model.Foto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FotoRepository extends JpaRepository<Foto, Integer> {
    List<Foto> findByProducto_IdentificadorOrderByIdentificadorAsc(Integer producto);
    
    Optional<Foto> findFirstByProducto_IdentificadorOrderByIdentificadorAsc(Integer productoId);
}
