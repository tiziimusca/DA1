package com.example.auctionapp.service;

import com.example.auctionapp.model.MetodoPagoTarjeta;
import com.example.auctionapp.repository.MetodoPagoTarjetaRepository;
import com.example.auctionapp.dto.MetodoPagoTarjetaDTO;
import com.example.auctionapp.dto.MetodoPagoTarjetaResponseDTO;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MetodoPagoTarjetaService {

    private final MetodoPagoTarjetaRepository repository;

    public MetodoPagoTarjetaService(MetodoPagoTarjetaRepository repository) {
        this.repository = repository;
    }

    public List<MetodoPagoTarjetaResponseDTO> obtenerPorCliente(Integer clienteId) {
        return repository.findByClienteId(clienteId)
                .stream()
                .map(this::mapearAResponseDTO)
                .collect(Collectors.toList());
    }

    public Optional<MetodoPagoTarjetaResponseDTO> obtenerPorId(Integer id) {
        return repository.findById(id)
                .map(this::mapearAResponseDTO);
    }

    public Optional<MetodoPagoTarjetaResponseDTO> obtenerPorIdYCliente(Integer id, Integer clienteId) {
        return repository.findByIdAndClienteId(id, clienteId)
                .map(this::mapearAResponseDTO);
    }

    public List<MetodoPagoTarjetaResponseDTO> obtenerPorClienteYEstado(Integer clienteId, String estado) {
        return repository.findByClienteIdAndEstado(clienteId, estado)
                .stream()
                .map(this::mapearAResponseDTO)
                .collect(Collectors.toList());
    }

    public MetodoPagoTarjetaResponseDTO crear(Integer clienteId, MetodoPagoTarjetaDTO dto) {
        validarDatos(dto);

        MetodoPagoTarjeta tarjeta = new MetodoPagoTarjeta();
        tarjeta.setClienteId(clienteId);
        tarjeta.setNombreTitular(dto.getNombreTitular());
        tarjeta.setNumeroTarjeta(dto.getNumeroTarjeta());
        tarjeta.setFechaVencimiento(dto.getFechaVencimiento());
        tarjeta.setCvv(dto.getCvv());
        tarjeta.setEstado("en_revision");

        MetodoPagoTarjeta guardada = repository.save(tarjeta);
        return mapearAResponseDTO(guardada);
    }

    public MetodoPagoTarjetaResponseDTO actualizar(Integer id, Integer clienteId, MetodoPagoTarjetaDTO dto) {
        validarDatos(dto);

        MetodoPagoTarjeta tarjeta = repository.findByIdAndClienteId(id, clienteId)
                .orElseThrow(() -> new RuntimeException("Método de pago tarjeta no encontrado"));

        tarjeta.setNombreTitular(dto.getNombreTitular());
        tarjeta.setNumeroTarjeta(dto.getNumeroTarjeta());
        tarjeta.setFechaVencimiento(dto.getFechaVencimiento());
        tarjeta.setCvv(dto.getCvv());

        MetodoPagoTarjeta actualizada = repository.save(tarjeta);
        return mapearAResponseDTO(actualizada);
    }

    public void eliminar(Integer id, Integer clienteId) {
        MetodoPagoTarjeta tarjeta = repository.findByIdAndClienteId(id, clienteId)
                .orElseThrow(() -> new RuntimeException("Método de pago tarjeta no encontrado"));
        repository.deleteById(id);
    }

    public MetodoPagoTarjetaResponseDTO cambiarEstado(Integer id, Integer clienteId, String nuevoEstado) {
        MetodoPagoTarjeta tarjeta = repository.findByIdAndClienteId(id, clienteId)
                .orElseThrow(() -> new RuntimeException("Método de pago tarjeta no encontrado"));
        tarjeta.setEstado(nuevoEstado);
        MetodoPagoTarjeta actualizada = repository.save(tarjeta);
        return mapearAResponseDTO(actualizada);
    }

    private void validarDatos(MetodoPagoTarjetaDTO dto) {
        if (dto.getNombreTitular() == null || dto.getNombreTitular().isEmpty()) {
            throw new IllegalArgumentException("El nombre del titular es obligatorio");
        }
        if (dto.getNumeroTarjeta() == null) {
            throw new IllegalArgumentException("El número de tarjeta es obligatorio");
        }
        String numeroStr = String.valueOf(dto.getNumeroTarjeta());
        if (!numeroStr.matches("\\d{13,19}")) {
            throw new IllegalArgumentException("El número de tarjeta debe contener entre 13 y 19 dígitos");
        }
        if (dto.getFechaVencimiento() == null || !dto.getFechaVencimiento().matches("\\d{2}/\\d{2}")) {
            throw new IllegalArgumentException("La fecha de vencimiento debe estar en formato MM/YY");
        }
        if (dto.getCvv() == null || dto.getCvv().isEmpty()) {
            throw new IllegalArgumentException("El CVV es obligatorio");
        }
    }

    private MetodoPagoTarjetaResponseDTO mapearAResponseDTO(MetodoPagoTarjeta tarjeta) {
        MetodoPagoTarjetaResponseDTO dto = new MetodoPagoTarjetaResponseDTO();
        dto.setId(tarjeta.getId());
        dto.setEstado(tarjeta.getEstado());

        MetodoPagoTarjetaResponseDTO.MetodoPagoTarjetaDatosDTO datos = new MetodoPagoTarjetaResponseDTO.MetodoPagoTarjetaDatosDTO();
        datos.setNombreTitular(tarjeta.getNombreTitular());
        datos.setNumeroTarjeta(enmascararTarjeta(tarjeta.getNumeroTarjeta()));
        datos.setFechaVencimiento(tarjeta.getFechaVencimiento());

        dto.setDatos(datos);
        return dto;
    }

    private String enmascararTarjeta(Long numeroTarjeta) {
        String tarjetaStr = String.valueOf(numeroTarjeta);
        return "**** **** **** " + tarjetaStr.substring(Math.max(0, tarjetaStr.length() - 4));
    }
}
