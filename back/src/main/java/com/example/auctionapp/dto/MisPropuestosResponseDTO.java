package com.example.auctionapp.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class MisPropuestosResponseDTO {
    
    private Integer usuarioId;
    private List<productoPropuestoDTO> productos;
    
}