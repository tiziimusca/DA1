package com.example.auctionapp.service;

import com.example.auctionapp.model.Cliente;
import com.example.auctionapp.repository.ClienteRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<Cliente> obtenerTodos() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> obtenerPorId(Integer id) {
        return clienteRepository.findById(id);
    }

    public Cliente crear(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public Cliente actualizar(Integer id, Cliente cliente) {
        return clienteRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(cliente, existing, "identificador");
                    return clienteRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    public void eliminar(Integer id) {
        clienteRepository.deleteById(id);
    }
}
