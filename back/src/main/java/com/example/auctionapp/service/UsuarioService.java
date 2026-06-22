package com.example.auctionapp.service;

import com.example.auctionapp.model.Usuario;
import com.example.auctionapp.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerPorId(Integer id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public Usuario crear(Usuario usuario) {
        if (usuario.getPassword() != null) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        return usuarioRepository.save(usuario);
    }

    public Usuario actualizar(Integer id, Usuario usuario) {
        return usuarioRepository.findById(id)
                .map(existing -> {
                    existing.setEmail(usuario.getEmail());
                    existing.setDorso_doc(usuario.getDorso_doc());
                    existing.setFrente_doc(usuario.getFrente_doc());
                    if (usuario.getPassword() != null && !usuario.getPassword().isBlank()) {
                        existing.setPassword(passwordEncoder.encode(usuario.getPassword()));
                    }
                    existing.setPersonaId(usuario.getPersonaId());
                    return usuarioRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public void eliminar(Integer id) {
        usuarioRepository.deleteById(id);
    }
}
