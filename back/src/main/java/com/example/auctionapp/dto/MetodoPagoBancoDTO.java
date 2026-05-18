package com.example.auctionapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MetodoPagoBancoDTO {

    @NotBlank(message = "El nombre del titular es obligatorio")
    private String nombreTitular;

    @NotNull(message = "El DNI del titular es obligatorio")
    private Integer dniTitular;

    @NotBlank(message = "El nombre del banco es obligatorio")
    private String nombreBanco;

    @NotBlank(message = "El número de cuenta es obligatorio")
    private String numeroCuenta;
}
