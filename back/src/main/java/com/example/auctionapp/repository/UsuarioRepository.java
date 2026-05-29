package com.example.auctionapp.repository;

import com.example.auctionapp.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByEmail(String email);

    Boolean existsByEmail(String email);

    Optional<Usuario> findByPersonaId(Integer personaId);
}
