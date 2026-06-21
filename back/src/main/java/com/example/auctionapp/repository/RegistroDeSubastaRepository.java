package com.example.auctionapp.repository;

import com.example.auctionapp.model.RegistroDeSubasta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RegistroDeSubastaRepository extends JpaRepository<RegistroDeSubasta, Integer> {
    List<RegistroDeSubasta> findByCliente_Identificador(Integer clienteId);
    int countByCliente_Identificador(Integer clienteId);
}
