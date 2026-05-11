package com.example.auctionapp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "asistentes")
public class Asistente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    private Integer numeroPostor;

    private Integer cliente;

    private Integer subasta;

    public Integer getIdentificador() {
        return identificador;
    }

    public void setIdentificador(Integer identificador) {
        this.identificador = identificador;
    }

    public Integer getNumeroPostor() {
        return numeroPostor;
    }

    public void setNumeroPostor(Integer numeroPostor) {
        this.numeroPostor = numeroPostor;
    }

    public Integer getCliente() {
        return cliente;
    }

    public void setCliente(Integer cliente) {
        this.cliente = cliente;
    }

    public Integer getSubasta() {
        return subasta;
    }

    public void setSubasta(Integer subasta) {
        this.subasta = subasta;
    }
}
