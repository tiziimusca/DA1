package com.example.auctionapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UsuarioDTO {

    private Integer identificador;

    @NotBlank
    @Email
    @Size(max = 255)
    private String email;

    private byte[] dorso_doc;
    private byte[] frente_doc;

    @NotBlank
    @Size(min = 8, max = 255)
    private String password;

    @NotNull
    private Integer personaId;

    public Integer getIdentificador() {
        return identificador;
    }

    public void setIdentificador(Integer identificador) {
        this.identificador = identificador;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public byte[] getDorso_doc() {
        return dorso_doc;
    }

    public void setDorso_doc(byte[] dorso_doc) {
        this.dorso_doc = dorso_doc;
    }

    public byte[] getFrente_doc() {
        return frente_doc;
    }

    public void setFrente_doc(byte[] frente_doc) {
        this.frente_doc = frente_doc;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getPersonaId() {
        return personaId;
    }

    public void setPersonaId(Integer personaId) {
        this.personaId = personaId;
    }
}
