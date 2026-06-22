package com.example.auctionapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ActualizarPerfilClienteRequestDTO {
    @NotBlank
    @Size(max = 150)
    private String nombre;

    @NotBlank
    @Size(max = 150)
    private String apellido;

    @NotNull
    private Integer idPaisNacimiento;

    @NotBlank
    @Size(max = 250)
    private String direccion;

    @Size(min = 8, max = 255)
    private String password;

    private String foto;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public Integer getIdPaisNacimiento() {
        return idPaisNacimiento;
    }

    public void setIdPaisNacimiento(Integer idPaisNacimiento) {
        this.idPaisNacimiento = idPaisNacimiento;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFoto() {
        return foto;
    }

    public void setFoto(String foto) {
        this.foto = foto;
    }
}
