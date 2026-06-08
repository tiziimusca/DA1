package com.example.auctionapp.controller;

import com.example.auctionapp.dto.CatalogoResponseDTO;
import com.example.auctionapp.dto.SubastaActivaDTO;
import com.example.auctionapp.dto.SubastaDTO;
import com.example.auctionapp.model.Subasta;
import com.example.auctionapp.service.CatalogoService;
import com.example.auctionapp.service.SubastaService;
import com.example.auctionapp.util.MapperUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/subastas")
public class SubastaController {

    private final SubastaService subastaService;
    private final CatalogoService catalogoService;

    public SubastaController(SubastaService subastaService, CatalogoService catalogoService) {
        this.subastaService = subastaService;
        this.catalogoService = catalogoService;
    }

    @GetMapping
    public List<SubastaDTO> listar() {
        return subastaService.obtenerTodas().stream().map(MapperUtil::toSubastaDTO).collect(Collectors.toList());
    }

    @GetMapping("/abiertas")
    public List<SubastaDTO> obtenerAbiertas() {
        return subastaService.obtenerAbiertas().stream().map(MapperUtil::toSubastaDTO).collect(Collectors.toList());
    }

    @GetMapping("/activas")
    public List<SubastaActivaDTO> obtenerActivas() {
        return subastaService.obtenerActivas();
    }

    @GetMapping("/proximas")
    public List<SubastaDTO> obtenerProximas() {
        return subastaService.obtenerProximas().stream().map(MapperUtil::toSubastaDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubastaDTO> buscar(@PathVariable Integer id) {
        return subastaService.obtenerPorId(id)
                .map(MapperUtil::toSubastaDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public SubastaDTO crear(@Valid @RequestBody SubastaDTO subastaDto) {
        Subasta subasta = MapperUtil.toSubastaEntity(subastaDto);
        return MapperUtil.toSubastaDTO(subastaService.crear(subasta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubastaDTO> actualizar(@PathVariable Integer id, @Valid @RequestBody SubastaDTO subastaDto) {
        try {
            Subasta subasta = MapperUtil.toSubastaEntity(subastaDto);
            return ResponseEntity.ok(MapperUtil.toSubastaDTO(subastaService.actualizar(id, subasta)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        subastaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/catalogo")
    public ResponseEntity<CatalogoResponseDTO> getCatalogoPorSubasta(
            @PathVariable Integer id,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            CatalogoResponseDTO response = catalogoService.obtenerCatalogoPorSubasta(id, authorizationHeader);
            if (response.getItems() == null || response.getItems().isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
