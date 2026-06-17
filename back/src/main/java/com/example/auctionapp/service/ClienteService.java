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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
                persona.getDireccion());
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

        personaRepository.save(persona);
        clienteRepository.save(cliente);
        usuarioRepository.save(usuario);

        return new PerfilClienteResponseDTO(
                cliente.getIdentificador(),
                persona.getNombre(),
                capitalizar(cliente.getCategoria()),
                pais.getNombre(),
                persona.getEstado(),
                persona.getDireccion());
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
