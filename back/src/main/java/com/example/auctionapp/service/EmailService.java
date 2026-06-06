package com.example.auctionapp.service;

public interface EmailService {
    void enviarCodigoRecuperacion(String to, String codigo);

    void enviarConfirmacionRegistro(String to, String nombre);
}
