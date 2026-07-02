package com.example.auctionapp.repository;

import com.example.auctionapp.model.Deudor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeudorRepository extends JpaRepository<Deudor, Integer> {
    Optional<Deudor> findByUsuarioId(Integer usuarioId);
    boolean existsByUsuarioId(Integer usuarioId);
}
