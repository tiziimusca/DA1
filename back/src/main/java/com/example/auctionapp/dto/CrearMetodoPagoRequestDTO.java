package com.example.auctionapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.databind.JsonNode;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrearMetodoPagoRequestDTO {

    @NotBlank(message = "El tipo de método de pago es obligatorio")
    private String tipo; // "banco", "tarjeta", "cheque"

    @NotNull(message = "Los datos del método de pago son obligatorios")
    private JsonNode datos;
}
