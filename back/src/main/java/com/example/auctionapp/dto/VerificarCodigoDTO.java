package com.example.auctionapp.dto;

import jakarta.validation.constraints.NotBlank;

public class VerificarCodigoDTO {

    @NotBlank(message = "El código no puede estar vacío")
    private String codigo;

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }
}
