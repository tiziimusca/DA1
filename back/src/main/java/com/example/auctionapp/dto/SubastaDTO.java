package com.example.auctionapp.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public class SubastaDTO {

    private Integer identificador;

    @NotNull
    private LocalDate fecha;

    @NotNull
    private LocalTime hora;

    @Size(max = 10)
    private String estado;

    @NotNull
    private Integer subastador;

    @Size(max = 350)
    private String ubicacion;

    private Integer capacidadAsistentes;

    @Size(max = 2)
    private String tieneDeposito;

    @Size(max = 2)
    private String seguridadPropia;

    @Size(max = 10)
    private String categoria;

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

    public LocalTime getHora() {
        return hora;
    }

    public void setHora(LocalTime hora) {
        this.hora = hora;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Integer getSubastador() {
        return subastador;
    }

    public void setSubastador(Integer subastador) {
        this.subastador = subastador;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public Integer getCapacidadAsistentes() {
        return capacidadAsistentes;
    }

    public void setCapacidadAsistentes(Integer capacidadAsistentes) {
        this.capacidadAsistentes = capacidadAsistentes;
    }

    public String getTieneDeposito() {
        return tieneDeposito;
    }

    public void setTieneDeposito(String tieneDeposito) {
        this.tieneDeposito = tieneDeposito;
    }

    public String getSeguridadPropia() {
        return seguridadPropia;
    }

    public void setSeguridadPropia(String seguridadPropia) {
        this.seguridadPropia = seguridadPropia;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }
}