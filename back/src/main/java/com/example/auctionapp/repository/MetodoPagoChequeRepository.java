package com.example.auctionapp.repository;

import com.example.auctionapp.model.MetodoPagoCheque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetodoPagoChequeRepository extends JpaRepository<MetodoPagoCheque, Integer> {

    List<MetodoPagoCheque> findByClienteId(Integer clienteId);

    Optional<MetodoPagoCheque> findByIdAndClienteId(Integer id, Integer clienteId);

    List<MetodoPagoCheque> findByClienteIdAndEstado(Integer clienteId, String estado);
}
