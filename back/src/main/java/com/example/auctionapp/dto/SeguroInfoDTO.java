package com.example.auctionapp.dto;

import java.math.BigDecimal;

public class SeguroInfoDTO {
    private String compania;
    private String poliza;
    private BigDecimal monto;
    
    public String getCompania() {
        return compania;
    }

    public void setCompania(String compania) {
        this.compania = compania;
    }

    public String getPoliza() {
        return poliza;
    }

    public void setPoliza(String poliza) {
        this.poliza = poliza;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }
}