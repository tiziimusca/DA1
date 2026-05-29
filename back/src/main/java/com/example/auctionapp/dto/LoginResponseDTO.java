package com.example.auctionapp.dto;

public class LoginResponseDTO {

    private String token;
    private Integer usuarioId;
    private String nombre;
    private String foto;
    private String categoria;

    public LoginResponseDTO(String token, Integer usuarioId, String nombre, String foto, String categoria) {
        this.token = token;
        this.usuarioId = usuarioId;
        this.nombre = nombre;
        this.foto = foto;
        this.categoria = categoria;
    }

    // Getters
    public String getToken() {
        return token;
    }

    public Integer getUsuarioId() {
        return usuarioId;
    }

    public String getNombre() {
        return nombre;
    }

    public String getFoto() {
        return foto;
    }

    public String getCategoria() {
        return categoria;
    }

    // Setters
    public void setToken(String token) {
        this.token = token;
    }

    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setFoto(String foto) {
        this.foto = foto;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }
}