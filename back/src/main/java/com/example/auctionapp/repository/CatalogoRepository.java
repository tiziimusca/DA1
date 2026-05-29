package com.example.auctionapp.repository;

import com.example.auctionapp.model.Catalogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CatalogoRepository extends JpaRepository<Catalogo, Integer> {
    Optional<Catalogo> findBySubasta_Identificador(Integer subastaId);
}
