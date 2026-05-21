package com.example.auctionapp.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class ProductoDTO {

    private Integer identificador;

    private LocalDate fecha;

    @Size(max = 2)
    private String disponible;

    @Size(max = 500)
    private String descripcionCatalogo;

    @NotNull
    @Size(max = 300)
    private String descripcionCompleta;

    @NotNull
    private Integer revisorId;

    @NotNull
    private Integer duenioId;

    @Size(max = 30)
    private String seguro;

    public Integer getIdentificador() {
        return identificador;
    }

    public void setIdentificador(Integer identificador) {
        this.identificador = identificador;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getDisponible() {
        return disponible;
    }

    public void setDisponible(String disponible) {
        this.disponible = disponible;
    }

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

    public String getSeguro() {
        return seguro;
    }

    public void setSeguro(String seguro) {
        this.seguro = seguro;
    }
}
