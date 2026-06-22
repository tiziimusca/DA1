package com.example.auctionapp.service;

import com.example.auctionapp.model.*;
import com.example.auctionapp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CompraService {

    private final SubastaRepository subastaRepository;
    private final CatalogoRepository catalogoRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final PujaRepository pujaRepository;
    private final DuenoRepository duenoRepository;
    private final EmpleadoRepository empleadoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final HistorialEstadoRepository historialEstadoRepository;
    private final jakarta.persistence.EntityManager entityManager;

    public CompraService(SubastaRepository subastaRepository,
            CatalogoRepository catalogoRepository,
            ItemCatalogoRepository itemCatalogoRepository,
            PujaRepository pujaRepository,
            DuenoRepository duenoRepository,
            EmpleadoRepository empleadoRepository,
            ProductoRepository productoRepository,
            UsuarioRepository usuarioRepository,
            HistorialEstadoRepository historialEstadoRepository,
            jakarta.persistence.EntityManager entityManager) {
        this.subastaRepository = subastaRepository;
        this.catalogoRepository = catalogoRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.pujaRepository = pujaRepository;
        this.duenoRepository = duenoRepository;
        this.empleadoRepository = empleadoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.historialEstadoRepository = historialEstadoRepository;
        this.entityManager = entityManager;
    }

    @Transactional
    public Optional<Subasta> completarPago(Integer subastaId) {
        Optional<Subasta> subastaOpt = subastaRepository.findById(subastaId);
        if (subastaOpt.isEmpty()) {
            return Optional.empty();
        }
        Subasta subasta = subastaOpt.get();

        Optional<Catalogo> catalogoOpt = catalogoRepository.findBySubasta_Identificador(subastaId);
        if (catalogoOpt.isEmpty()) {
            throw new RuntimeException("Catalogo no encontrado para la subasta");
        }
        Catalogo catalogo = catalogoOpt.get();

        List<ItemCatalogo> items = itemCatalogoRepository
                .findByCatalogo_IdentificadorOrderByIdentificadorAsc(catalogo.getIdentificador());
        if (items.isEmpty()) {
            throw new RuntimeException("No hay items en el catalogo de la subasta");
        }
        ItemCatalogo item = items.get(0);

        Optional<Puja> pujaGanadoraOpt = pujaRepository
                .findTopByItem_IdentificadorOrderByImporteDesc(item.getIdentificador());
        if (pujaGanadoraOpt.isPresent()) {
            Puja pujaGanadora = pujaGanadoraOpt.get();
            Cliente clienteGanador = pujaGanadora.getAsistente().getCliente();
            Persona personaGanadora = clienteGanador.getPersona();

            Integer newDuenioId = personaGanadora.getIdentificador();
            if (!duenoRepository.existsById(newDuenioId)) {
                Dueno nuevoDueno = new Dueno();
                nuevoDueno.setIdentificador(newDuenioId);
                nuevoDueno.setPersona(personaGanadora);
                if (clienteGanador.getNumeroPais() != null) {
                    nuevoDueno.setNumeroPais(clienteGanador.getNumeroPais().getNumero());
                }
                nuevoDueno.setVerificacionFinanciera("NO");
                nuevoDueno.setVerificacionJudicial("NO");
                nuevoDueno.setCalificacionRiesgo(1);
                Empleado verificador = empleadoRepository.findFirstByOrderByIdentificadorAsc();
                if (verificador == null) {
                    throw new RuntimeException("No hay empleados verificadores disponibles");
                }
                nuevoDueno.setVerificador(verificador);
                entityManager.persist(nuevoDueno);
            }

            subasta.setEstado("finalizada");
            subastaRepository.save(subasta);

            item.setSubastado("SI");
            itemCatalogoRepository.save(item);

            Producto producto = item.getProducto();
            producto.setDuenio(newDuenioId);
            productoRepository.save(producto);

            pujaGanadora.setGanador("SI");
            pujaRepository.save(pujaGanadora);

            HistorialEstado historial = new HistorialEstado();
            historial.setEstado("comprado");
            historial.setFechaCambio(LocalDateTime.now());
            historial.setProducto(producto);
            Usuario usuarioGanador = usuarioRepository.findByPersonaId(newDuenioId).orElse(null);
            historial.setUsuario(usuarioGanador);
            historialEstadoRepository.save(historial);
        } else {
            subasta.setEstado("finalizada");
            subastaRepository.save(subasta);
        }

        return Optional.of(subasta);
    }
}
