package com.example.auctionapp.service;

import org.springframework.stereotype.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.Instant;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

import com.example.auctionapp.dto.LoginRequestDTO;
import com.example.auctionapp.dto.LoginResponseDTO;
import com.example.auctionapp.dto.RegistroRequestDTO;
import com.example.auctionapp.dto.RegistroResponseDTO;
import com.example.auctionapp.dto.ResetearPasswordDTO;
import com.example.auctionapp.dto.VerificarCodigoResponseDTO;
import com.example.auctionapp.model.Cliente;
import com.example.auctionapp.model.Empleado;
import com.example.auctionapp.model.Persona;
import com.example.auctionapp.model.Usuario;
import com.example.auctionapp.repository.ClienteRepository;
import com.example.auctionapp.repository.PersonaRepository;
import com.example.auctionapp.repository.UsuarioRepository;
import com.example.auctionapp.repository.PaisRepository;
import com.example.auctionapp.repository.EmpleadoRepository;

import jakarta.transaction.Transactional;

@Service
public class AuthService {

    private final PersonaRepository personaRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final PaisRepository paisRepository;
    private final EmpleadoRepository empleadoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SmtpEmailService smtpEmailService;
    private final RecoveryCodeStore recoveryCodeStore;

    // Rate limiter: map email -> deque of request timestamps
    private final ConcurrentHashMap<String, Deque<Instant>> requestTimestamps = new ConcurrentHashMap<>();
    private final int MAX_REQUESTS = 3;
    private final Duration WINDOW = Duration.ofMinutes(15);

    public AuthService(PersonaRepository personaRepository,
            ClienteRepository clienteRepository,
            UsuarioRepository usuarioRepository,
            PaisRepository paisRepository,
            EmpleadoRepository empleadoRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            SmtpEmailService smtpEmailService,
            RecoveryCodeStore recoveryCodeStore) {
        this.personaRepository = personaRepository;
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.paisRepository = paisRepository;
        this.empleadoRepository = empleadoRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.smtpEmailService = smtpEmailService;
        this.recoveryCodeStore = recoveryCodeStore;
    }

    @Transactional
    public RegistroResponseDTO registrarUsuario(RegistroRequestDTO request) {
        // 1. Validaciones
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email inválido");
        }

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email duplicado");
        }

        if (request.getDocumento() == null || request.getDocumento().isBlank()) {
            throw new IllegalArgumentException("Documento inválido");
        }

        // Validación simple para documento: solo dígitos entre 6 y 12
        if (!request.getDocumento().matches("\\d{6,12}")) {
            throw new IllegalArgumentException("Documento inválido");
        }

        if (personaRepository.existsByDocumento(request.getDocumento())) {
            throw new IllegalArgumentException("Documento duplicado");
        }

        if (request.getFotoDocumentoFrente() == null || request.getFotoDocumentoFrente().length == 0
                || request.getFotoDocumentoDorso() == null || request.getFotoDocumentoDorso().length == 0) {
            throw new IllegalArgumentException("Faltan fotos obligatorias");
        }

        // 2. Creamos la Persona -> Con los datos del request
        Persona nuevaPersona = new Persona();
        nuevaPersona.setDocumento(request.getDocumento());
        nuevaPersona.setNombre(request.getNombre());
        nuevaPersona.setDireccion(request.getDireccion());
        // Si se registra con el email especial, marcar persona como Activo
        String specialEmail = "nina.12.6el@gmail.com";
        boolean isSpecial = request.getEmail() != null && request.getEmail().equalsIgnoreCase(specialEmail);
        nuevaPersona.setEstado(isSpecial ? "Activo" : "inactivo");

        Persona personaGuardada = personaRepository.save(nuevaPersona);

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setPersonaId(personaGuardada.getIdentificador());
        nuevoUsuario.setEmail(request.getEmail());
        nuevoUsuario.setDorso_doc(request.getFotoDocumentoDorso());
        nuevoUsuario.setFrente_doc(request.getFotoDocumentoFrente());
        // No password is assigned at registration. The user will create it later via "Generate new password".
        nuevoUsuario.setPassword("");

        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        Cliente nuevoCliente = new Cliente();
        nuevoCliente.setPersona(personaGuardada);
        // Si se registra con el email especial, marcar cliente como admitido
        nuevoCliente.setAdmitido(isSpecial ? "si" : "no");
        nuevoCliente.setNumeroPais(paisRepository.getPaisByNumero(request.getNumeroPais()));
        nuevoCliente.setCategoria("comun");
        Empleado verificador = empleadoRepository.findFirstByOrderByIdentificadorAsc();
        if (verificador == null) {
            throw new IllegalArgumentException("No hay empleados disponibles para verificar el registro");
        }
        nuevoCliente.setVerificador(verificador);

        Cliente clienteGuardado = clienteRepository.save(nuevoCliente);

        smtpEmailService.enviarConfirmacionRegistro(request.getEmail(), request.getNombre());

        return new RegistroResponseDTO(personaGuardada.getIdentificador(), personaGuardada.getEstado());
    }

    public LoginResponseDTO autenticar(LoginRequestDTO request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email inexistente"));

        if (usuario.getPassword() == null || usuario.getPassword().isBlank()) {
            throw new IllegalArgumentException("Cuenta sin contraseña. Genere una nueva contraseña desde el apartado correspondiente.");
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new IllegalArgumentException("Credenciales incorrectas");
        }

        Cliente cliente = clienteRepository.findById(usuario.getPersonaId())
                .orElseThrow(() -> new IllegalArgumentException("Cuenta inactiva o no aprobada"));

        if ("inactivo".equalsIgnoreCase(cliente.getAdmitido())) {
            throw new IllegalArgumentException("Cuenta aún no aprobada");
        }

        Persona persona = personaRepository.findById(usuario.getPersonaId())
                .orElseThrow(() -> new IllegalArgumentException("Persona inexistente"));

        return new LoginResponseDTO(
                jwtService.generarTokenAutenticacion(usuario.getEmail()),
                cliente.getIdentificador(),
                persona.getNombre(),
                "url_de_foto_mock",
                cliente.getCategoria());
    }

    public void enviarCodigoRecuperacion(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email inválido");
        }

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email inexistente"));

        Integer personaId = usuario.getPersonaId();
        if (personaId == null) {
            throw new IllegalArgumentException("Usuario sin persona asociada");
        }

        // Limita la cantidad de solicitudes por email
        Deque<Instant> deque = requestTimestamps.computeIfAbsent(email, k -> new ArrayDeque<>());
        Instant now = Instant.now();
        synchronized (deque) {
            while (!deque.isEmpty() && deque.peekFirst().isBefore(now.minus(WINDOW))) {
                deque.removeFirst();
            }
            if (deque.size() >= MAX_REQUESTS) {
                throw new IllegalStateException("Demasiadas solicitudes, intente más tarde");
            }
            deque.addLast(now);
        }

        Cliente cliente = clienteRepository.findById(personaId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado"));

        // Generar código de 6 letras
        String codigo = generarCodigoLetras(6);

        // Guardamos el código en memoria, no en la base de datos
        recoveryCodeStore.save(email, codigo, Duration.ofMinutes(15));

        // Enviar email con el código
        smtpEmailService.enviarCodigoRecuperacion(email, codigo);
    }

    private String generarCodigoLetras(int length) {
        final String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        java.security.SecureRandom random = new java.security.SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int idx = random.nextInt(alphabet.length());
            sb.append(alphabet.charAt(idx));
        }
        return sb.toString();
    }

    private String generarPasswordTemporal(int length) {
        final String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        final String specialChars = "!@#$%^&*()_-+=";
        java.security.SecureRandom random = new java.security.SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length - 2; i++) {
            int idx = random.nextInt(alphabet.length());
            sb.append(alphabet.charAt(idx));
        }
        sb.append(specialChars.charAt(random.nextInt(specialChars.length())));
        sb.append(specialChars.charAt(random.nextInt(specialChars.length())));
        return sb.toString();
    }

    public VerificarCodigoResponseDTO validarCodigo(String codigo) {
        String email = recoveryCodeStore.consumeValidCode(codigo);

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Generamos un token especial corto para el reseteo
        String tokenReseteo = jwtService.generarTokenReseteo(usuario.getEmail());

        return new VerificarCodigoResponseDTO(tokenReseteo);
    }

    public void actualizarPassword(ResetearPasswordDTO request, String authorizationHeader) {
        if (request == null) {
            throw new IllegalArgumentException("Solicitud inválida");
        }

        if (!request.getNuevaPassword().equals(request.getConfirmarPassword())) {
            throw new IllegalArgumentException("Las contraseñas no coinciden");
        }

        validarComplejidadPassword(request.getNuevaPassword());

        String tokenHeader = jwtService.extraerToken(authorizationHeader);
        String tokenBody = request.getTokenReseteo();

        if (tokenHeader == null || tokenHeader.isBlank()) {
            throw new SecurityException("Token de reseteo inválido");
        }

        if (tokenBody != null && !tokenBody.isBlank() && !tokenHeader.equals(tokenBody)) {
            throw new SecurityException("Token de reseteo inválido");
        }

        String tokenReseteo = tokenBody != null && !tokenBody.isBlank() ? tokenBody : tokenHeader;
        String email = jwtService.validarTokenReseteo(tokenReseteo);

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("Token de reseteo inválido"));

        usuario.setPassword(passwordEncoder.encode(request.getNuevaPassword()));
        usuarioRepository.save(usuario);

        jwtService.marcarTokenReseteoUsado(tokenReseteo);
    }

    private void validarComplejidadPassword(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("La contraseña es demasiado débil");
        }

        boolean tieneEspecial = password.matches(".*[!@#$%^&*()_+\\-={}\\[\\]:;\"'<>.,?/\\\\|].*");
        if (!tieneEspecial) {
            throw new IllegalArgumentException("La contraseña es demasiado débil");
        }
    }
}
