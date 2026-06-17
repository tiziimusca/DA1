package com.example.auctionapp.repository;

import com.example.auctionapp.model.Asistente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AsistenteRepository extends JpaRepository<Asistente, Integer> {
    Optional<Asistente> findByCliente_IdentificadorAndSubasta_Identificador(Integer clienteId, Integer subastaId);
    int countBySubasta_Identificador(Integer subastaId);
}
