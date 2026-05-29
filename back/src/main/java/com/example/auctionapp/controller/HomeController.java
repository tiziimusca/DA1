package com.example.auctionapp.controller;

import com.example.auctionapp.dto.HomeResponseDTO;
import com.example.auctionapp.service.HomeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    private final HomeService homeService;

    public HomeController(HomeService homeService) {
        this.homeService = homeService;
    }

    @GetMapping
    public ResponseEntity<HomeResponseDTO> home(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return ResponseEntity.ok(homeService.obtenerHome(authorizationHeader));
    }
}
