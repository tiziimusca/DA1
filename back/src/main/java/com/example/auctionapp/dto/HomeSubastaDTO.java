package com.example.auctionapp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class HomeSubastaDTO {
    private Integer id;
    private String titulo;
    private String moneda;
    private String categoria;
    private BigDecimal precioBase;
    private LocalDate fecha;
    private byte[] foto;

    public HomeSubastaDTO() {
    }

    public HomeSubastaDTO(Integer id, String titulo, String moneda, String categoria, BigDecimal precioBase,
            LocalDate fecha, byte[] foto) {
        this.id = id;
        this.titulo = titulo;
        this.moneda = moneda;
        this.categoria = categoria;
        this.precioBase = precioBase;
        this.fecha = fecha;
        this.foto = foto;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getMoneda() {
        return moneda;
    }

    public void setMoneda(String moneda) {
        this.moneda = moneda;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public BigDecimal getPrecioBase() {
        return precioBase;
    }

    public void setPrecioBase(BigDecimal precioBase) {
        this.precioBase = precioBase;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

        public byte[] getFoto() {
        return foto;
    }

    public void setFoto(byte[] foto) {
        this.foto = foto;
    }

}
