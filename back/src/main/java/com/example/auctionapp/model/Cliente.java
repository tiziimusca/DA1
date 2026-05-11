package com.example.auctionapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "clientes")
public class Cliente {

    @Id
    private Integer identificador;

    private Integer numeroPais;

    @Column(length = 2)
    private String admitido;

    @Column(length = 10)
    private String categoria;

    private Integer verificador;

    public Integer getIdentificador() {
        return identificador;
    }

    public void setIdentificador(Integer identificador) {
        this.identificador = identificador;
    }

    public Integer getNumeroPais() {
        return numeroPais;
    }

    public void setNumeroPais(Integer numeroPais) {
        this.numeroPais = numeroPais;
    }

    public String getAdmitido() {
        return admitido;
    }

    public void setAdmitido(String admitido) {
        this.admitido = admitido;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public Integer getVerificador() {
        return verificador;
    }

    public void setVerificador(Integer verificador) {
        this.verificador = verificador;
    }
}
