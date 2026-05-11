package com.example.auctionapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "seguros")
public class Seguro {

    @Id
    @Column(length = 30)
    private String nroPoliza;

    @Column(nullable = false, length = 150)
    private String compania;

    @Column(length = 2)
    private String polizaCombinada;

    @Column(nullable = false)
    private BigDecimal importe;

    public String getNroPoliza() {
        return nroPoliza;
    }

    public void setNroPoliza(String nroPoliza) {
        this.nroPoliza = nroPoliza;
    }

    public String getCompania() {
        return compania;
    }

    public void setCompania(String compania) {
        this.compania = compania;
    }

    public String getPolizaCombinada() {
        return polizaCombinada;
    }

    public void setPolizaCombinada(String polizaCombinada) {
        this.polizaCombinada = polizaCombinada;
    }

    public BigDecimal getImporte() {
        return importe;
    }

    public void setImporte(BigDecimal importe) {
        this.importe = importe;
    }
}
