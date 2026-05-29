package com.example.auctionapp.repository;

import com.example.auctionapp.model.Persona;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, Integer> {
    Boolean existsByDocumento(String documento);
}
