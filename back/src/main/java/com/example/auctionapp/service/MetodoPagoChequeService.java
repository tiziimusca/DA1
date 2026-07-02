package com.example.auctionapp.service;

import com.example.auctionapp.model.MetodoPagoCheque;
import com.example.auctionapp.repository.MetodoPagoChequeRepository;
import com.example.auctionapp.dto.MetodoPagoChequeDTO;
import com.example.auctionapp.dto.MetodoPagoChequeResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MetodoPagoChequeService {

    private final MetodoPagoChequeRepository repository;

    @Value("${app.fotos.path:/uploads/cheques}")
    private String fotosPath;

    public MetodoPagoChequeService(MetodoPagoChequeRepository repository) {
        this.repository = repository;
    }

    public List<MetodoPagoChequeResponseDTO> obtenerPorCliente(Integer clienteId) {
        return repository.findByClienteId(clienteId)
                .stream()
                .map(this::mapearAResponseDTO)
                .collect(Collectors.toList());
    }

    public Optional<MetodoPagoChequeResponseDTO> obtenerPorId(Integer id) {
        return repository.findById(id)
                .map(this::mapearAResponseDTO);
    }

    public Optional<MetodoPagoChequeResponseDTO> obtenerPorIdYCliente(Integer id, Integer clienteId) {
        return repository.findByIdAndClienteId(id, clienteId)
                .map(this::mapearAResponseDTO);
    }

    public List<MetodoPagoChequeResponseDTO> obtenerPorClienteYEstado(Integer clienteId, String estado) {
        return repository.findByClienteIdAndEstado(clienteId, estado)
                .stream()
                .map(this::mapearAResponseDTO)
                .collect(Collectors.toList());
    }

    public MetodoPagoChequeResponseDTO crear(Integer clienteId, MetodoPagoChequeDTO dto) {
        validarDatos(dto);

        byte[] fotoFrenteBinary = decodificarBase64(dto.getFotoFrente());
        byte[] fotoDorsoBinary = decodificarBase64(dto.getFotoDorso());

        MetodoPagoCheque cheque = new MetodoPagoCheque();
        cheque.setClienteId(clienteId);
        cheque.setNumeroCheque(dto.getNumeroCheque());
        cheque.setFotoFrente(fotoFrenteBinary);
        cheque.setFotoDorso(fotoDorsoBinary);
        cheque.setEstado("en_revision");

        MetodoPagoCheque guardado = repository.save(cheque);
        return mapearAResponseDTO(guardado);
    }

    public MetodoPagoChequeResponseDTO actualizar(Integer id, Integer clienteId, MetodoPagoChequeDTO dto) {
        validarDatosParciales(dto);

        MetodoPagoCheque cheque = repository.findByIdAndClienteId(id, clienteId)
                .orElseThrow(() -> new RuntimeException("Método de pago cheque no encontrado"));

        if (dto.getNumeroCheque() != null) {
            cheque.setNumeroCheque(dto.getNumeroCheque());
        }
        if (dto.getFotoFrente() != null && !dto.getFotoFrente().isEmpty()) {
            cheque.setFotoFrente(decodificarBase64(dto.getFotoFrente()));
        }
        if (dto.getFotoDorso() != null && !dto.getFotoDorso().isEmpty()) {
            cheque.setFotoDorso(decodificarBase64(dto.getFotoDorso()));
        }

        MetodoPagoCheque actualizado = repository.save(cheque);
        return mapearAResponseDTO(actualizado);
    }

    private void validarDatosParciales(MetodoPagoChequeDTO dto) {
        boolean hasAnyField = dto.getNumeroCheque() != null
                || (dto.getFotoFrente() != null && !dto.getFotoFrente().isEmpty())
                || (dto.getFotoDorso() != null && !dto.getFotoDorso().isEmpty());

        if (!hasAnyField) {
            throw new IllegalArgumentException("Debe indicar al menos un campo para actualizar");
        }
        if (dto.getNumeroCheque() != null && dto.getNumeroCheque() <= 0) {
            throw new IllegalArgumentException("El número de cheque debe ser válido");
        }
        if (dto.getFotoFrente() != null && dto.getFotoFrente().isEmpty()) {
            throw new IllegalArgumentException("La foto del frente no puede estar vacía");
        }
        if (dto.getFotoDorso() != null && dto.getFotoDorso().isEmpty()) {
            throw new IllegalArgumentException("La foto del dorso no puede estar vacía");
        }
    }

    public void eliminar(Integer id, Integer clienteId) {
        MetodoPagoCheque cheque = repository.findByIdAndClienteId(id, clienteId)
                .orElseThrow(() -> new RuntimeException("Método de pago cheque no encontrado"));
        repository.deleteById(id);
    }

    public MetodoPagoChequeResponseDTO cambiarEstado(Integer id, Integer clienteId, String nuevoEstado) {
        MetodoPagoCheque cheque = repository.findByIdAndClienteId(id, clienteId)
                .orElseThrow(() -> new RuntimeException("Método de pago cheque no encontrado"));
        cheque.setEstado(nuevoEstado);
        MetodoPagoCheque actualizado = repository.save(cheque);
        return mapearAResponseDTO(actualizado);
    }

    private void validarDatos(MetodoPagoChequeDTO dto) {
        if (dto.getNumeroCheque() == null || dto.getNumeroCheque() <= 0) {
            throw new IllegalArgumentException("El número de cheque es obligatorio y debe ser válido");
        }
        if (dto.getFotoFrente() == null || dto.getFotoFrente().isEmpty()) {
            throw new IllegalArgumentException("La foto del frente es obligatoria");
        }
        if (dto.getFotoDorso() == null || dto.getFotoDorso().isEmpty()) {
            throw new IllegalArgumentException("La foto del dorso es obligatoria");
        }
    }

    private byte[] decodificarBase64(String base64String) {
        try {
            return Base64.getDecoder().decode(base64String);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("El formato base64 de la foto es inválido");
        }
    }

    private MetodoPagoChequeResponseDTO mapearAResponseDTO(MetodoPagoCheque cheque) {
        MetodoPagoChequeResponseDTO dto = new MetodoPagoChequeResponseDTO();
        dto.setId(cheque.getId());
        dto.setEstado(cheque.getEstado());

        MetodoPagoChequeResponseDTO.MetodoPagoChequePhotosDTO fotos = new MetodoPagoChequeResponseDTO.MetodoPagoChequePhotosDTO();
        fotos.setFrente(Base64.getEncoder().encodeToString(cheque.getFotoFrente()));
        fotos.setDorso(Base64.getEncoder().encodeToString(cheque.getFotoDorso()));

        MetodoPagoChequeResponseDTO.MetodoPagoChequeDatosDTO datos = new MetodoPagoChequeResponseDTO.MetodoPagoChequeDatosDTO();
        datos.setNumeroCheque(enmascararCheque(cheque.getNumeroCheque()));
        datos.setFotos(fotos);
        datos.setMontoDisponible(cheque.getMontoDisponible());

        dto.setDatos(datos);
        dto.setMontoDisponible(cheque.getMontoDisponible());
        return dto;
    }

    private String enmascararCheque(Integer numeroCheque) {
        String chequeStr = String.valueOf(numeroCheque);
        return "********" + chequeStr.substring(Math.max(0, chequeStr.length() - 4));
    }
}
