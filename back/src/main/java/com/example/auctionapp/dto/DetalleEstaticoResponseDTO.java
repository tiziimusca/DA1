package com.example.auctionapp.dto;

import java.util.List;

public class DetalleEstaticoResponseDTO {
    private String titulo;
    private String descripcion;
    private String duenio;
    private String rematador;
    private String fecha;
    private List<DetalleEstaticoItemDTO> items;

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDuenio() {
        return duenio;
    }

    public void setDuenio(String duenio) {
        this.duenio = duenio;
    }

    public String getRematador() {
        return rematador;
    }

    public void setRematador(String rematador) {
        this.rematador = rematador;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public List<DetalleEstaticoItemDTO> getItems() {
        return items;
    }

    public void setItems(List<DetalleEstaticoItemDTO> items) {
        this.items = items;
    }
}