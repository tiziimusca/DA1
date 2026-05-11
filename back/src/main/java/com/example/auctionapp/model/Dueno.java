package com.example.auctionapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "duenios")
public class Dueno {

    @Id
    private Integer identificador;

    private Integer numeroPais;

    @Column(length = 2)
    private String verificacionFinanciera;

    @Column(length = 2)
    private String verificacionJudicial;

    private Integer calificacionRiesgo;

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

    public String getVerificacionFinanciera() {
        return verificacionFinanciera;
    }

    public void setVerificacionFinanciera(String verificacionFinanciera) {
        this.verificacionFinanciera = verificacionFinanciera;
    }

    public String getVerificacionJudicial() {
        return verificacionJudicial;
    }

    public void setVerificacionJudicial(String verificacionJudicial) {
        this.verificacionJudicial = verificacionJudicial;
    }

    public Integer getCalificacionRiesgo() {
        return calificacionRiesgo;
    }

    public void setCalificacionRiesgo(Integer calificacionRiesgo) {
        this.calificacionRiesgo = calificacionRiesgo;
    }

    public Integer getVerificador() {
        return verificador;
    }

    public void setVerificador(Integer verificador) {
        this.verificador = verificador;
    }
}
