package com.example.auctionapp.dto;

import java.time.LocalDate;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ProponerProductoDTO {

    @NotNull
    private String titulo;

    @Size(max = 500)
    private String descripcionCatalogo;

    @NotNull
    @Size(max = 300)
    private String descripcionCompleta;

    // El revisor lo asigna el sistema (ver MapperUtil: default al empleado 1), no viene del body.
    @Schema(hidden = true)
    private Integer revisorId;

    // El dueño se deriva del token (Authorization) en el controller, no del body.
    @Schema(hidden = true)
    private Integer duenioId;

    @Size(max = 500)
    private String historia;

    @NotNull(message = "Faltan imágenes")
    @Size(min = 6, message = "Faltan imágenes (mínimo 6)")
    private List<String> fotos;

    @AssertTrue(message = "No se aceptó la declaración legal")
    private Boolean declaracionPropiedad;


    public String getDescripcionCatalogo() {
        return descripcionCatalogo;
    }

    public void setDescripcionCatalogo(String descripcionCatalogo) {
        this.descripcionCatalogo = descripcionCatalogo;
    }

    public String getDescripcionCompleta() {
        return descripcionCompleta;
    }

    public void setDescripcionCompleta(String descripcionCompleta) {
        this.descripcionCompleta = descripcionCompleta;
    }

    public Integer getRevisorId() {
        return revisorId;
    }

    public void setRevisorId(Integer revisorId) {
        this.revisorId = revisorId;
    }

    public Integer getDuenioId() {
        return duenioId;
    }

    public void setDuenioId(Integer duenioId) {
        this.duenioId = duenioId;
    }


    public List<String> getFotos() {
        return fotos;
    }

    public void setFotos(List<String> fotos) {
        this.fotos = fotos;
    }

    public Boolean getDeclaracionPropiedad() {
        return declaracionPropiedad;
    }

    public void setDeclaracionPropiedad(Boolean declaracionPropiedad) {
        this.declaracionPropiedad = declaracionPropiedad;
    }

    public String getHistoria() {
        return historia;
    }

    public void setHistoria(String historia) {
        this.historia = historia;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }
}
