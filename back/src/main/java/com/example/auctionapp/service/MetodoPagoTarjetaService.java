package com.example.auctionapp.service;

import com.example.auctionapp.model.MetodoPagoTarjeta;
import com.example.auctionapp.model.MetodoPagoTarjetaTipo;
import com.example.auctionapp.repository.MetodoPagoTarjetaRepository;
import com.example.auctionapp.repository.MetodoPagoTarjetaTipoRepository;
import com.example.auctionapp.dto.MetodoPagoTarjetaDTO;
import com.example.auctionapp.dto.MetodoPagoTarjetaResponseDTO;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MetodoPagoTarjetaService {

    private final MetodoPagoTarjetaRepository repository;
    private final MetodoPagoTarjetaTipoRepository tipoRepository;

    public MetodoPagoTarjetaService(MetodoPagoTarjetaRepository repository,
                                    MetodoPagoTarjetaTipoRepository tipoRepository) {
        this.repository = repository;
        this.tipoRepository = tipoRepository;
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
        guardarTipoTarjeta(guardada.getId(), dto.getTipoTarjeta());
        return mapearAResponseDTO(guardada);
    }

    public MetodoPagoTarjetaResponseDTO actualizar(Integer id, Integer clienteId, MetodoPagoTarjetaDTO dto) {
        validarDatosParciales(dto);

        MetodoPagoTarjeta tarjeta = repository.findByIdAndClienteId(id, clienteId)
                .orElseThrow(() -> new RuntimeException("Método de pago tarjeta no encontrado"));

        System.out.println("[MetodoPagoTarjetaService] Actualizando tarjeta ID: " + id + " para cliente: " + clienteId);
        
        if (dto.getNombreTitular() != null && !dto.getNombreTitular().isEmpty()) {
            tarjeta.setNombreTitular(dto.getNombreTitular());
        }
        if (dto.getNumeroTarjeta() != null) {
            tarjeta.setNumeroTarjeta(dto.getNumeroTarjeta());
        }
        if (dto.getFechaVencimiento() != null && !dto.getFechaVencimiento().isEmpty()) {
            tarjeta.setFechaVencimiento(dto.getFechaVencimiento());
        }
        if (dto.getCvv() != null && !dto.getCvv().isEmpty()) {
            tarjeta.setCvv(dto.getCvv());
        }

        MetodoPagoTarjeta actualizada = repository.save(tarjeta);
        System.out.println("[MetodoPagoTarjetaService] Tarjeta actualizada con ID: " + actualizada.getId());
        
        if (dto.getTipoTarjeta() != null && !dto.getTipoTarjeta().isEmpty()) {
            actualizarTipoTarjeta(actualizada.getId(), dto.getTipoTarjeta());
        }
        
        MetodoPagoTarjetaResponseDTO response = mapearAResponseDTO(actualizada);
        System.out.println("[MetodoPagoTarjetaService] Respuesta DTO: " + response.getId());
        return response;
    }

    public void eliminar(Integer id, Integer clienteId) {
        MetodoPagoTarjeta tarjeta = repository.findByIdAndClienteId(id, clienteId)
                .orElseThrow(() -> new RuntimeException("Método de pago tarjeta no encontrado"));
        tipoRepository.findByMetodoPagoTarjetaId(tarjeta.getId()).ifPresent(tipoRepository::delete);
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
        if (dto.getTipoTarjeta() == null || dto.getTipoTarjeta().isEmpty()) {
            throw new IllegalArgumentException("El tipo de tarjeta es obligatorio");
        }
    }

    private void validarDatosParciales(MetodoPagoTarjetaDTO dto) {
        boolean hasAnyField = (dto.getNombreTitular() != null && !dto.getNombreTitular().isEmpty())
                || dto.getNumeroTarjeta() != null
                || (dto.getFechaVencimiento() != null && !dto.getFechaVencimiento().isEmpty())
                || (dto.getCvv() != null && !dto.getCvv().isEmpty())
                || (dto.getTipoTarjeta() != null && !dto.getTipoTarjeta().isEmpty());

        if (!hasAnyField) {
            throw new IllegalArgumentException("Debe indicar al menos un campo para actualizar");
        }
        if (dto.getNombreTitular() != null && dto.getNombreTitular().isEmpty()) {
            throw new IllegalArgumentException("El nombre del titular no puede estar vacío");
        }
        if (dto.getNumeroTarjeta() != null) {
            String numeroStr = String.valueOf(dto.getNumeroTarjeta());
            if (!numeroStr.matches("\\d{13,19}")) {
                throw new IllegalArgumentException("El número de tarjeta debe contener entre 13 y 19 dígitos");
            }
        }
        if (dto.getFechaVencimiento() != null && !dto.getFechaVencimiento().isEmpty()) {
            if (!dto.getFechaVencimiento().matches("\\d{2}/\\d{2}")) {
                throw new IllegalArgumentException("La fecha de vencimiento debe estar en formato MM/YY");
            }
        }
        if (dto.getCvv() != null && !dto.getCvv().isEmpty()) {
            if (!dto.getCvv().matches("\\d{3,4}")) {
                throw new IllegalArgumentException("El CVV debe tener 3 o 4 dígitos");
            }
        }
        if (dto.getTipoTarjeta() != null && dto.getTipoTarjeta().isEmpty()) {
            throw new IllegalArgumentException("El tipo de tarjeta no puede estar vacío");
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
        datos.setTipoTarjeta(obtenerTipoDeTarjeta(tarjeta.getId()));

        dto.setDatos(datos);
        return dto;
    }

    private String obtenerTipoDeTarjeta(Integer tarjetaId) {
        return tipoRepository.findByMetodoPagoTarjetaId(tarjetaId)
                .map(MetodoPagoTarjetaTipo::getTipoTarjeta)
                .orElse(null);
    }

    private void guardarTipoTarjeta(Integer tarjetaId, String tipoTarjeta) {
        MetodoPagoTarjetaTipo tipo = new MetodoPagoTarjetaTipo();
        tipo.setMetodoPagoTarjetaId(tarjetaId);
        tipo.setTipoTarjeta(tipoTarjeta);
        tipoRepository.save(tipo);
    }

    private void actualizarTipoTarjeta(Integer tarjetaId, String tipoTarjeta) {
        Optional<MetodoPagoTarjetaTipo> tipoExistente = tipoRepository.findByMetodoPagoTarjetaId(tarjetaId);
        if (tipoExistente.isPresent()) {
            MetodoPagoTarjetaTipo tipo = tipoExistente.get();
            tipo.setTipoTarjeta(tipoTarjeta);
            tipoRepository.save(tipo);
        } else {
            guardarTipoTarjeta(tarjetaId, tipoTarjeta);
        }
    }

    private String enmascararTarjeta(Long numeroTarjeta) {
        String tarjetaStr = String.valueOf(numeroTarjeta);
        return "**** **** **** " + tarjetaStr.substring(Math.max(0, tarjetaStr.length() - 4));
    }
}
