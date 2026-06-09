package com.example.auctionapp.service;

import com.example.auctionapp.model.MetodoPagoBanco;
import com.example.auctionapp.repository.MetodoPagoBancoRepository;
import com.example.auctionapp.dto.MetodoPagoBancoDTO;
import com.example.auctionapp.dto.MetodoPagoBancoResponseDTO;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MetodoPagoBancoService {

    private final MetodoPagoBancoRepository repository;

    public MetodoPagoBancoService(MetodoPagoBancoRepository repository) {
        this.repository = repository;
    }

    public List<MetodoPagoBancoResponseDTO> obtenerPorCliente(Integer clienteId) {
        return repository.findByClienteId(clienteId)
                .stream()
                .map(this::mapearAResponseDTO)
                .collect(Collectors.toList());
    }

    public Optional<MetodoPagoBancoResponseDTO> obtenerPorId(Integer id) {
        return repository.findById(id)
                .map(this::mapearAResponseDTO);
    }

    public Optional<MetodoPagoBancoResponseDTO> obtenerPorIdYCliente(Integer id, Integer clienteId) {
        return repository.findByIdAndClienteId(id, clienteId)
                .map(this::mapearAResponseDTO);
    }

    public List<MetodoPagoBancoResponseDTO> obtenerPorClienteYEstado(Integer clienteId, String estado) {
        return repository.findByClienteIdAndEstado(clienteId, estado)
                .stream()
                .map(this::mapearAResponseDTO)
                .collect(Collectors.toList());
    }

    public MetodoPagoBancoResponseDTO crear(Integer clienteId, MetodoPagoBancoDTO dto) {
        validarDatos(dto);

        MetodoPagoBanco banco = new MetodoPagoBanco();
        banco.setClienteId(clienteId);
        banco.setNombreTitular(dto.getNombreTitular());
        banco.setDniTitular(dto.getDniTitular());
        banco.setNombreBanco(dto.getNombreBanco());
        banco.setNumeroCuenta(dto.getNumeroCuenta());
        banco.setEstado("en_revision");

        MetodoPagoBanco guardado = repository.save(banco);
        return mapearAResponseDTO(guardado);
    }

    public MetodoPagoBancoResponseDTO actualizar(Integer id, Integer clienteId, MetodoPagoBancoDTO dto) {
        validarDatosParciales(dto);

        MetodoPagoBanco banco = repository.findByIdAndClienteId(id, clienteId)
                .orElseThrow(() -> new RuntimeException("Método de pago banco no encontrado"));

        if (dto.getNombreTitular() != null && !dto.getNombreTitular().isEmpty()) {
            banco.setNombreTitular(dto.getNombreTitular());
        }
        if (dto.getDniTitular() != null) {
            banco.setDniTitular(dto.getDniTitular());
        }
        if (dto.getNombreBanco() != null && !dto.getNombreBanco().isEmpty()) {
            banco.setNombreBanco(dto.getNombreBanco());
        }
        if (dto.getNumeroCuenta() != null && !dto.getNumeroCuenta().isEmpty()) {
            banco.setNumeroCuenta(dto.getNumeroCuenta());
        }

        MetodoPagoBanco actualizado = repository.save(banco);
        return mapearAResponseDTO(actualizado);
    }

    private void validarDatosParciales(MetodoPagoBancoDTO dto) {
        boolean hasAnyField = (dto.getNombreTitular() != null && !dto.getNombreTitular().isEmpty())
                || dto.getDniTitular() != null
                || (dto.getNombreBanco() != null && !dto.getNombreBanco().isEmpty())
                || (dto.getNumeroCuenta() != null && !dto.getNumeroCuenta().isEmpty());

        if (!hasAnyField) {
            throw new IllegalArgumentException("Debe indicar al menos un campo para actualizar");
        }
        if (dto.getNombreTitular() != null && dto.getNombreTitular().isEmpty()) {
            throw new IllegalArgumentException("El nombre del titular no puede estar vacío");
        }
        if (dto.getDniTitular() != null && dto.getDniTitular() <= 0) {
            throw new IllegalArgumentException("El DNI debe ser un número válido");
        }
        if (dto.getNombreBanco() != null && dto.getNombreBanco().isEmpty()) {
            throw new IllegalArgumentException("El nombre del banco no puede estar vacío");
        }
        if (dto.getNumeroCuenta() != null && dto.getNumeroCuenta().isEmpty()) {
            throw new IllegalArgumentException("El número de cuenta no puede estar vacío");
        }
    }

    public void eliminar(Integer id, Integer clienteId) {
        MetodoPagoBanco banco = repository.findByIdAndClienteId(id, clienteId)
                .orElseThrow(() -> new RuntimeException("Método de pago banco no encontrado"));
        repository.deleteById(id);
    }

    public MetodoPagoBancoResponseDTO cambiarEstado(Integer id, Integer clienteId, String nuevoEstado) {
        MetodoPagoBanco banco = repository.findByIdAndClienteId(id, clienteId)
                .orElseThrow(() -> new RuntimeException("Método de pago banco no encontrado"));
        banco.setEstado(nuevoEstado);
        MetodoPagoBanco actualizado = repository.save(banco);
        return mapearAResponseDTO(actualizado);
    }

    private void validarDatos(MetodoPagoBancoDTO dto) {
        if (dto.getNombreTitular() == null || dto.getNombreTitular().isEmpty()) {
            throw new IllegalArgumentException("El nombre del titular es obligatorio");
        }
        if (dto.getDniTitular() == null || dto.getDniTitular() <= 0) {
            throw new IllegalArgumentException("El DNI debe ser un número válido");
        }
        if (dto.getNombreBanco() == null || dto.getNombreBanco().isEmpty()) {
            throw new IllegalArgumentException("El nombre del banco es obligatorio");
        }
        if (dto.getNumeroCuenta() == null || dto.getNumeroCuenta().isEmpty()) {
            throw new IllegalArgumentException("El número de cuenta es obligatorio");
        }
    }

    private MetodoPagoBancoResponseDTO mapearAResponseDTO(MetodoPagoBanco banco) {
        MetodoPagoBancoResponseDTO dto = new MetodoPagoBancoResponseDTO();
        dto.setId(banco.getId());
        dto.setEstado(banco.getEstado());

        MetodoPagoBancoResponseDTO.MetodoPagoBancoDatosDTO datos = new MetodoPagoBancoResponseDTO.MetodoPagoBancoDatosDTO();
        datos.setNombreTitular(banco.getNombreTitular());
        datos.setDniTitular(enmascararDNI(banco.getDniTitular()));
        datos.setNombreBanco(banco.getNombreBanco());
        datos.setNumeroCuenta(enmascararNumeroCuenta(banco.getNumeroCuenta()));

        dto.setDatos(datos);
        return dto;
    }

    private String enmascararDNI(Integer dni) {
        String dniStr = String.valueOf(dni);
        return dniStr.substring(0, Math.min(2, dniStr.length())) + "*".repeat(Math.max(0, dniStr.length() - 2));
    }

    private String enmascararNumeroCuenta(String numeroCuenta) {
        if (numeroCuenta == null || numeroCuenta.isEmpty()) {
            return "***";
        }
        return "***" + numeroCuenta.substring(Math.max(0, numeroCuenta.length() - 5));
    }
}
