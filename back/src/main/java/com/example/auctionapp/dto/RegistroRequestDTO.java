package com.example.auctionapp.dto;

import java.io.ByteArrayOutputStream;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RegistroRequestDTO {

    @NotBlank
    @Size(max = 50)
    private String documento;

    @NotBlank
    @Size(max = 150)
    private String nombre;

    @NotBlank
    @Size(max = 255)
    private String direccion;

    @NotNull
    private Integer numeroPais;

    @NotBlank
    @Email
    @Size(max = 255)
    private String email;

    @NotBlank
    @Size(min = 8, max = 255, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;

    @NotBlank(message = "La foto del frente es obligatoria")
    private byte[] fotoDocumentoFrente; // Asumiendo base64 según tu documento

    @NotBlank(message = "La foto del dorso es obligatoria")
    private byte[] fotoDocumentoDorso;

    // Getters
    public String getDocumento() {
        return documento;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDireccion() {
        return direccion;
    }

    public Integer getNumeroPais() {
        return numeroPais;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public byte[] getFotoDocumentoFrente() {
        return fotoDocumentoFrente;
    }

    public byte[] getFotoDocumentoDorso() {
        return fotoDocumentoDorso;
    }

    // Setters
    public void setDocumento(String documento) {
        this.documento = documento;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public void setNumeroPais(Integer numeroPais) {
        this.numeroPais = numeroPais;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setFotoDocumentoFrente(byte[] fotoDocumentoFrente) {
        this.fotoDocumentoFrente = fotoDocumentoFrente;
    }

    public void setFotoDocumentoDorso(byte[] fotoDocumentoDorso) {
        this.fotoDocumentoDorso = fotoDocumentoDorso;
    }
}
