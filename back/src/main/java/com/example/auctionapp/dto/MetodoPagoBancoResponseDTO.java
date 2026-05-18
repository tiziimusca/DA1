package com.example.auctionapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MetodoPagoBancoResponseDTO {

    private Integer id;
    private String tipo = "banco";
    private MetodoPagoBancoDatosDTO datos;
    private String estado;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetodoPagoBancoDatosDTO {
        private String nombreTitular;
        private String dniTitular; // Enmascarado o parcial
        private String nombreBanco;
        private String numeroCuenta; // Enmascarado
    }
}
