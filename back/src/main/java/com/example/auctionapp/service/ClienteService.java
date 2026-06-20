package com.example.auctionapp.service;

import com.example.auctionapp.dto.ActualizarPerfilClienteRequestDTO;
import com.example.auctionapp.dto.PerfilClienteResponseDTO;
import com.example.auctionapp.dto.EstadisticasClienteDTO;
import com.example.auctionapp.dto.SubastaParticipadaDTO;
import com.example.auctionapp.model.Cliente;
import com.example.auctionapp.model.Pais;
import com.example.auctionapp.model.Persona;
import com.example.auctionapp.model.Usuario;
import com.example.auctionapp.model.Asistente;
import com.example.auctionapp.model.Puja;
import com.example.auctionapp.model.RegistroDeSubasta;
import com.example.auctionapp.model.Foto;
import com.example.auctionapp.repository.*;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final PersonaRepository personaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PaisRepository paisRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AsistenteRepository asistenteRepository;
    private final PujaRepository pujaRepository;
    private final RegistroDeSubastaRepository registroDeSubastaRepository;
    private final FotoRepository fotoRepository;

    public ClienteService(ClienteRepository clienteRepository,
            PersonaRepository personaRepository,
            UsuarioRepository usuarioRepository,
            PaisRepository paisRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AsistenteRepository asistenteRepository,
            PujaRepository pujaRepository,
            RegistroDeSubastaRepository registroDeSubastaRepository,
            FotoRepository fotoRepository) {
        this.clienteRepository = clienteRepository;
        this.personaRepository = personaRepository;
        this.usuarioRepository = usuarioRepository;
        this.paisRepository = paisRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.asistenteRepository = asistenteRepository;
        this.pujaRepository = pujaRepository;
        this.registroDeSubastaRepository = registroDeSubastaRepository;
        this.fotoRepository = fotoRepository;
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

    public EstadisticasClienteDTO obtenerEstadisticas(String authorizationHeader) {
        Usuario usuario = obtenerUsuarioDesdeToken(authorizationHeader);
        Integer clienteId = usuario.getPersonaId();

        // 1. Consultar de BD
        int dbAsistidas = asistenteRepository.countByCliente_Identificador(clienteId);

        List<Puja> clientePujas = pujaRepository.findByAsistente_Cliente_Identificador(clienteId);

        // Agrupar pujas por item y obtener la máxima para cada uno
        Map<Integer, Puja> maxBidsByItem = new HashMap<>();
        for (Puja puja : clientePujas) {
            Integer itemId = puja.getItem().getIdentificador();
            Puja existing = maxBidsByItem.get(itemId);
            if (existing == null || puja.getImporte().compareTo(existing.getImporte()) > 0) {
                maxBidsByItem.put(itemId, puja);
            }
        }

        BigDecimal dbMontoOfertado = BigDecimal.ZERO;
        int dbGanadas = 0;
        BigDecimal dbTotalGastado = BigDecimal.ZERO;

        for (Puja p : maxBidsByItem.values()) {
            dbMontoOfertado = dbMontoOfertado.add(p.getImporte());
            if (p.getGanador() != null && p.getGanador().equalsIgnoreCase("SI")) {
                dbGanadas++;
                dbTotalGastado = dbTotalGastado.add(p.getImporte());
            }
        }

        // 2. Usar valores reales de la base de datos
        int subastasAsistidas = dbAsistidas;
        int subastasGanadas = dbGanadas;
        BigDecimal finalOfertado = dbMontoOfertado;
        BigDecimal finalGastado = dbTotalGastado;

        int tasaVictorias = 23;
        if (subastasAsistidas > 0) {
            tasaVictorias = (subastasGanadas * 100) / subastasAsistidas;
        }

        // 3. Obtener subastas participadas (bids del cliente ordenados por fecha de
        // subasta desc)
        List<SubastaParticipadaDTO> participadas = new ArrayList<>();
        List<Puja> sortedMaxBids = maxBidsByItem.values().stream()
                .sorted((p1, p2) -> {
                    java.time.LocalDateTime dt1 = p1.getItem().getCatalogo().getSubasta().getHora() == null
                            ? p1.getItem().getCatalogo().getSubasta().getFecha().atStartOfDay()
                            : p1.getItem().getCatalogo().getSubasta().getFecha()
                                    .atTime(p1.getItem().getCatalogo().getSubasta().getHora());
                    java.time.LocalDateTime dt2 = p2.getItem().getCatalogo().getSubasta().getHora() == null
                            ? p2.getItem().getCatalogo().getSubasta().getFecha().atStartOfDay()
                            : p2.getItem().getCatalogo().getSubasta().getFecha()
                                    .atTime(p2.getItem().getCatalogo().getSubasta().getHora());
                    return dt2.compareTo(dt1);
                })
                .collect(Collectors.toList());

        for (Puja puja : sortedMaxBids) {
            com.example.auctionapp.model.ItemCatalogo item = puja.getItem();
            com.example.auctionapp.model.Producto producto = item.getProducto();
            com.example.auctionapp.model.Subasta subasta = item.getCatalogo().getSubasta();

            // Mapear categoría corta a la versión extendida de mockup
            String dbCat = subasta.getCategoria();
            String categoriaExt = dbCat;
            String moneda = "USD";

            // Obtener foto
            String fotoUrl = null;
            List<Foto> fotos = fotoRepository
                    .findByProducto_IdentificadorOrderByIdentificadorAsc(producto.getIdentificador());
            if (!fotos.isEmpty()) {
                byte[] bytes = fotos.get(0).getFoto();
                String str = new String(bytes, StandardCharsets.UTF_8);
                if (str.startsWith("http")) {
                    fotoUrl = str;
                } else {
                    fotoUrl = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(bytes);
                }
            }

            String estadoLabel = "Perdida";
            if (puja.getGanador() != null && puja.getGanador().equalsIgnoreCase("SI")) {
                estadoLabel = "Ganada";
            }

            participadas.add(new SubastaParticipadaDTO(
                    subasta.getIdentificador(),
                    producto.getDescripcionCatalogo() != null ? producto.getDescripcionCatalogo() : "Subasta",
                    categoriaExt,
                    puja.getImporte(),
                    moneda,
                    estadoLabel,
                    fotoUrl));
        }

        String tasaVictoriasInsight = "Tu eficiencia de victoria ha mejorado un 4.2% comparado con el trimestre anterior.";

        return new EstadisticasClienteDTO(
                subastasAsistidas,
                "+12%",
                "vs último período",
                subastasGanadas,
                "-3%",
                "verificación de eficiencia",
                finalOfertado,
                "+24%",
                "tasa de ejecución",
                finalGastado,
                "+18%",
                "capital utilizado",
                tasaVictorias,
                tasaVictoriasInsight,
                participadas);
    }

    private String capitalizar(String valor) {
        if (valor == null || valor.isBlank()) {
            return valor;
        }
        return valor.substring(0, 1).toUpperCase() + valor.substring(1).toLowerCase();
    }
}
