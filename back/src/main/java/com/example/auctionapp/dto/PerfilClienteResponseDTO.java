package com.example.auctionapp.dto;

public class PerfilClienteResponseDTO {
    private Integer identificador;
    private String nombre;
    private String categoria;
    private String pais;
    private String estado;
    private String direccion;

    public PerfilClienteResponseDTO() {
    }

    public PerfilClienteResponseDTO(Integer identificador, String nombre, String categoria, String pais, String estado, String direccion) {
        this.identificador = identificador;
        this.nombre = nombre;
        this.categoria = categoria;
        this.pais = pais;
        this.estado = estado;
        this.direccion = direccion;
    }

    public Integer getIdentificador() {
        return identificador;
    }

    public void setIdentificador(Integer identificador) {
        this.identificador = identificador;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getPais() {
        return pais;
    }

    public void setPais(String pais) {
        this.pais = pais;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
}
