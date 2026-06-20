package com.example.auctionapp.service;

import com.example.auctionapp.dto.ActualizarPerfilClienteRequestDTO;
import com.example.auctionapp.dto.PerfilClienteResponseDTO;
import com.example.auctionapp.model.Cliente;
import com.example.auctionapp.model.Pais;
import com.example.auctionapp.model.Persona;
import com.example.auctionapp.model.Usuario;
import com.example.auctionapp.repository.ClienteRepository;
import com.example.auctionapp.repository.PaisRepository;
import com.example.auctionapp.repository.PersonaRepository;
import com.example.auctionapp.repository.UsuarioRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final PersonaRepository personaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PaisRepository paisRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public ClienteService(ClienteRepository clienteRepository,
            PersonaRepository personaRepository,
            UsuarioRepository usuarioRepository,
            PaisRepository paisRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.clienteRepository = clienteRepository;
        this.personaRepository = personaRepository;
        this.usuarioRepository = usuarioRepository;
        this.paisRepository = paisRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // estos chau
    public List<Cliente> obtenerTodos() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> obtenerPorId(Integer id) {
        return clienteRepository.findById(id);
    }

    public Cliente crear(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    // este se debería ir
    public Cliente actualizar(Integer id, Cliente cliente) {
        return clienteRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(cliente, existing, "identificador");
                    return clienteRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    public void eliminar(Integer id) {
        clienteRepository.deleteById(id);
    }

    public PerfilClienteResponseDTO obtenerPerfil(String authorizationHeader) {
        Usuario usuario = obtenerUsuarioDesdeToken(authorizationHeader);
        Cliente cliente = clienteRepository.findById(usuario.getPersonaId())
                .orElseThrow(() -> new SecurityException("Token inválido o sesión expirada"));
        Persona persona = personaRepository.findById(cliente.getIdentificador())
                .orElseThrow(() -> new SecurityException("Token inválido o sesión expirada"));

        return new PerfilClienteResponseDTO(
                cliente.getIdentificador(),
                persona.getNombre(),
                capitalizar(cliente.getCategoria()),
                cliente.getNumeroPais() != null ? cliente.getNumeroPais().getNombre() : null,
                persona.getEstado(),
                persona.getDireccion(),
                fotoBytesToBase64(persona.getFoto()));
        
    }

    public PerfilClienteResponseDTO actualizarPerfil(String authorizationHeader,
            ActualizarPerfilClienteRequestDTO request) {
        Usuario usuario = obtenerUsuarioDesdeToken(authorizationHeader);
        Cliente cliente = clienteRepository.findById(usuario.getPersonaId())
                .orElseThrow(() -> new SecurityException("Token inválido o sesión expirada"));
    
        Persona persona = personaRepository.findById(cliente.getIdentificador())
                .orElseThrow(() -> new SecurityException("Token inválido o sesión expirada"));
    
        String nombreCompleto = String.format("%s %s", request.getNombre().trim(), request.getApellido().trim());
        persona.setNombre(nombreCompleto);
        persona.setDireccion(request.getDireccion());
    
        Pais pais = paisRepository.findById(request.getIdPaisNacimiento())
                .orElseThrow(() -> new IllegalArgumentException("País no encontrado"));
        cliente.setNumeroPais(pais);
    
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }
    
        // Solo actualizamos la foto si el usuario mandó una nueva (string no vacío).
        // Si vino null/blank, dejamos la foto existente intacta en la entidad.
        if (request.getFoto() != null && !request.getFoto().isBlank()) {
            try {
                String fotoBase64 = request.getFoto();
                // Por si el front llega a mandar el prefijo data URI alguna vez
                // (ej: "data:image/jpeg;base64,...."), lo recortamos antes de decodificar.
                if (fotoBase64.contains(",")) {
                    fotoBase64 = fotoBase64.split(",")[1];
                }
                byte[] fotoBytes = Base64.getDecoder().decode(fotoBase64);
                persona.setFoto(fotoBytes);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("La foto enviada no es un Base64 válido");
            }
        }
    
        personaRepository.save(persona);
        clienteRepository.save(cliente);
        usuarioRepository.save(usuario);
    
        return new PerfilClienteResponseDTO(
                cliente.getIdentificador(),
                persona.getNombre(),
                capitalizar(cliente.getCategoria()),
                pais.getNombre(),
                persona.getEstado(),
                persona.getDireccion(),
                fotoBytesToBase64(persona.getFoto()));
    }
 
/**
 * Convierte los bytes de la foto a Base64 para devolverla al front,
 * lista para usar como <Image source={{ uri: \`data:image/jpeg;base64,${foto}\` }} />.
 * Devuelve null si la persona todavía no tiene foto guardada.
 */
    private String fotoBytesToBase64(byte[] fotoBytes) {
        if (fotoBytes == null || fotoBytes.length == 0) {
            return null;
        }
        return Base64.getEncoder().encodeToString(fotoBytes);
    }

    public Usuario obtenerUsuarioDesdeToken(String authorizationHeader) {
        String token = jwtService.extraerToken(authorizationHeader);
        if (token == null || token.isBlank()) {
            throw new SecurityException("Token inválido o sesión expirada");
        }

        String email = jwtService.validarTokenAutenticacion(token);
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("Token inválido o sesión expirada"));
    }

    private String capitalizar(String valor) {
        if (valor == null || valor.isBlank()) {
            return valor;
        }
        return valor.substring(0, 1).toUpperCase() + valor.substring(1).toLowerCase();
    }
}
