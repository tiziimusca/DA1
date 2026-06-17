package com.example.auctionapp.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class PujaBidRequestDTO {

    private Integer asistenteId;

    @NotNull
    private Integer itemId;

    @NotNull
    @DecimalMin(value = "0.01", inclusive = true)
    private BigDecimal importe;

    public Integer getAsistenteId() {
        return asistenteId;
    }

    public void setAsistenteId(Integer asistenteId) {
        this.asistenteId = asistenteId;
    }

    public Integer getItemId() {
        return itemId;
    }

    public void setItemId(Integer itemId) {
        this.itemId = itemId;
    }

    public BigDecimal getImporte() {
        return importe;
    }

    public void setImporte(BigDecimal importe) {
        this.importe = importe;
    }
}
