package com.example.auctionapp.dto;

import java.math.BigDecimal;

public class SubastaParticipadaDTO {
    private Integer identificador;
    private String titulo;
    private String categoria;
    private BigDecimal monto;
    private String moneda;
    private String estado;
    private String imagenUrl;

    public SubastaParticipadaDTO() {
    }

    public SubastaParticipadaDTO(Integer identificador, String titulo, String categoria, BigDecimal monto, String moneda, String estado, String imagenUrl) {
        this.identificador = identificador;
        this.titulo = titulo;
        this.categoria = categoria;
        this.monto = monto;
        this.moneda = moneda;
        this.estado = estado;
        this.imagenUrl = imagenUrl;
    }

    public Integer getIdentificador() {
        return identificador;
    }

    public void setIdentificador(Integer identificador) {
        this.identificador = identificador;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public String getMoneda() {
        return moneda;
    }

    public void setMoneda(String moneda) {
        this.moneda = moneda;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }
}
