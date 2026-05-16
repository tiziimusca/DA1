package com.example.auctionapp.controller;

import com.example.auctionapp.dto.UsuarioDTO;
import com.example.auctionapp.model.Usuario;
import com.example.auctionapp.service.UsuarioService;
import com.example.auctionapp.util.MapperUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<UsuarioDTO> listar() {
        return usuarioService.obtenerTodos()
                .stream()
                .map(MapperUtil::toUsuarioDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> buscar(@PathVariable Integer id) {
        return usuarioService.obtenerPorId(id)
                .map(MapperUtil::toUsuarioDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UsuarioDTO> crear(@Valid @RequestBody UsuarioDTO dto) {
        Usuario u = MapperUtil.toUsuarioEntity(dto);
        Usuario saved = usuarioService.crear(u);
        return ResponseEntity.ok(MapperUtil.toUsuarioDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDTO> actualizar(@PathVariable Integer id, @Valid @RequestBody UsuarioDTO dto) {
        Usuario u = MapperUtil.toUsuarioEntity(dto);
        try {
            Usuario updated = usuarioService.actualizar(id, u);
            return ResponseEntity.ok(MapperUtil.toUsuarioDTO(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
