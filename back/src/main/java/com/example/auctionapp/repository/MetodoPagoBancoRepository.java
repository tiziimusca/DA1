package com.example.auctionapp.repository;

import com.example.auctionapp.model.MetodoPagoBanco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetodoPagoBancoRepository extends JpaRepository<MetodoPagoBanco, Integer> {

    List<MetodoPagoBanco> findByClienteId(Integer clienteId);

    Optional<MetodoPagoBanco> findByIdAndClienteId(Integer id, Integer clienteId);

    List<MetodoPagoBanco> findByClienteIdAndEstado(Integer clienteId, String estado);
}
