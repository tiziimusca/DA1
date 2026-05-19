package com.example.auctionapp.service;

import com.example.auctionapp.model.Empleado;
import com.example.auctionapp.repository.EmpleadoRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;

    public EmpleadoService(EmpleadoRepository empleadoRepository) {
        this.empleadoRepository = empleadoRepository;
    }

    public List<Empleado> obtenerTodos() {
        return empleadoRepository.findAll();
    }

    public Optional<Empleado> obtenerPorId(Integer id) {
        return empleadoRepository.findById(id);
    }

    public Empleado crear(Empleado empleado) {
        return empleadoRepository.save(empleado);
    }

    public Empleado actualizar(Integer id, Empleado empleado) {
        return empleadoRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(empleado, existing, "identificador");
                    return empleadoRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
    }

    public void eliminar(Integer id) {
        empleadoRepository.deleteById(id);
    }
}
