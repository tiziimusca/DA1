package com.example.auctionapp.util;

import com.example.auctionapp.dto.PaisDTO;
import com.example.auctionapp.dto.PersonaDTO;
import com.example.auctionapp.dto.ProductoDTO;
import com.example.auctionapp.dto.SubastaDTO;
import com.example.auctionapp.dto.UsuarioDTO;
import com.example.auctionapp.model.Pais;
import com.example.auctionapp.model.Persona;
import com.example.auctionapp.model.Producto;
import com.example.auctionapp.model.Subasta;
import com.example.auctionapp.model.Usuario;

public class MapperUtil {

    public static Pais toPaisEntity(PaisDTO dto) {
        if (dto == null)
            return null;
        Pais pais = new Pais();
        pais.setNumero(dto.getNumero());
        pais.setNombre(dto.getNombre());
        pais.setNombreCorto(dto.getNombreCorto());
        pais.setCapital(dto.getCapital());
        pais.setNacionalidad(dto.getNacionalidad());
        pais.setIdiomas(dto.getIdiomas());
        return pais;
    }

    public static PaisDTO toPaisDTO(Pais pais) {
        if (pais == null)
            return null;
        PaisDTO dto = new PaisDTO();
        dto.setNumero(pais.getNumero());
        dto.setNombre(pais.getNombre());
        dto.setNombreCorto(pais.getNombreCorto());
        dto.setCapital(pais.getCapital());
        dto.setNacionalidad(pais.getNacionalidad());
        dto.setIdiomas(pais.getIdiomas());
        return dto;
    }

    public static Subasta toSubastaEntity(SubastaDTO dto) {
        if (dto == null)
            return null;
        Subasta subasta = new Subasta();
        subasta.setIdentificador(dto.getIdentificador());
        subasta.setFecha(dto.getFecha());
        subasta.setHora(dto.getHora());
        subasta.setEstado(dto.getEstado());
        subasta.setSubastador(dto.getSubastador());
        subasta.setUbicacion(dto.getUbicacion());
        subasta.setCapacidadAsistentes(dto.getCapacidadAsistentes());
        subasta.setTieneDeposito(dto.getTieneDeposito());
        subasta.setSeguridadPropia(dto.getSeguridadPropia());
        subasta.setCategoria(dto.getCategoria());
        return subasta;
    }

    public static SubastaDTO toSubastaDTO(Subasta subasta) {
        if (subasta == null)
            return null;
        SubastaDTO dto = new SubastaDTO();
        dto.setIdentificador(subasta.getIdentificador());
        dto.setFecha(subasta.getFecha());
        dto.setHora(subasta.getHora());
        dto.setEstado(subasta.getEstado());
        dto.setSubastador(subasta.getSubastador());
        dto.setUbicacion(subasta.getUbicacion());
        dto.setCapacidadAsistentes(subasta.getCapacidadAsistentes());
        dto.setTieneDeposito(subasta.getTieneDeposito());
        dto.setSeguridadPropia(subasta.getSeguridadPropia());
        dto.setCategoria(subasta.getCategoria());
        return dto;
    }

    public static Producto toProductoEntity(ProductoDTO dto) {
        if (dto == null)
            return null;
        Producto p = new Producto();
        p.setIdentificador(dto.getIdentificador());
        p.setFecha(dto.getFecha());
        p.setDisponible(dto.getDisponible());
        p.setDescripcionCatalogo(dto.getDescripcionCatalogo());
        p.setDescripcionCompleta(dto.getDescripcionCompleta());
        p.setRevisor(dto.getRevisorId());
        p.setDuenio(dto.getDuenioId());
        p.setSeguro(dto.getSeguro());
        return p;
    }

    public static ProductoDTO toProductoDTO(Producto p) {
        if (p == null)
            return null;
        ProductoDTO dto = new ProductoDTO();
        dto.setIdentificador(p.getIdentificador());
        dto.setFecha(p.getFecha());
        dto.setDisponible(p.getDisponible());
        dto.setDescripcionCatalogo(p.getDescripcionCatalogo());
        dto.setDescripcionCompleta(p.getDescripcionCompleta());
        dto.setRevisorId(p.getRevisor());
        dto.setDuenioId(p.getDuenio());
        dto.setSeguro(p.getSeguro());
        return dto;
    }

    public static Persona toPersonaEntity(PersonaDTO dto) {
        if (dto == null)
            return null;
        Persona p = new Persona();
        p.setIdentificador(dto.getIdentificador());
        p.setDocumento(dto.getDocumento());
        p.setNombre(dto.getNombre());
        p.setDireccion(dto.getDireccion());
        p.setEstado(dto.getEstado());
        p.setFoto(dto.getFoto());
        return p;
    }

    public static PersonaDTO toPersonaDTO(Persona p) {
        if (p == null)
            return null;
        PersonaDTO dto = new PersonaDTO();
        dto.setIdentificador(p.getIdentificador());
        dto.setDocumento(p.getDocumento());
        dto.setNombre(p.getNombre());
        dto.setDireccion(p.getDireccion());
        dto.setEstado(p.getEstado());
        dto.setFoto(p.getFoto());
        return dto;
    }

    public static Usuario toUsuarioEntity(UsuarioDTO dto) {
        if (dto == null)
            return null;
        Usuario u = new Usuario();
        u.setIdentificador(dto.getIdentificador());
        u.setEmail(dto.getEmail());
        u.setDorso_doc(dto.getDorso_doc());
        u.setFrente_doc(dto.getFrente_doc());
        // password hashing must be applied in service
        u.setPassword(dto.getPassword());
        u.setPersonaId(dto.getPersonaId());
        return u;
    }

    public static UsuarioDTO toUsuarioDTO(Usuario u) {
        if (u == null)
            return null;
        UsuarioDTO dto = new UsuarioDTO();
        dto.setIdentificador(u.getIdentificador());
        dto.setEmail(u.getEmail());
        dto.setDorso_doc(u.getDorso_doc());
        dto.setFrente_doc(u.getFrente_doc());
        dto.setPersonaId(u.getPersonaId());
        return dto;
    }
}
