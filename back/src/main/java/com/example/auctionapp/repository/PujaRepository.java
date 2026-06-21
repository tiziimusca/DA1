package com.example.auctionapp.repository;

import com.example.auctionapp.model.Puja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface PujaRepository extends JpaRepository<Puja, Integer> {

    Optional<Puja> findTopByItem_IdentificadorOrderByImporteDesc(Integer itemId);

    List<Puja> findByItem_IdentificadorOrderByImporteDesc(Integer itemId);

    List<Puja> findByAsistente_Cliente_Identificador(Integer clienteId);

    long countByAsistente_Cliente_IdentificadorAndGanadorIgnoreCase(Integer clienteId, String ganador);
}
