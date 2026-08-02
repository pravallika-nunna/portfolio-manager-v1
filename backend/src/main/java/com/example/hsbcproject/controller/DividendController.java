package com.example.hsbcproject.controller;

import com.example.hsbcproject.dto.CreateDividendRequest;
import com.example.hsbcproject.dto.DividendResponse;
import com.example.hsbcproject.service.DividendService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.net.URI;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/dividends")
@Tag(name = "Dividends", description = "Track dividend payments received")
public class DividendController {

    private final DividendService dividendService;

    public DividendController(DividendService dividendService) {
        this.dividendService = dividendService;
    }

    @GetMapping
    @Operation(summary = "List all dividend records, optionally filter by ticker")
    public List<DividendResponse> getAll(@RequestParam(required = false) String ticker) {
        if (ticker != null && !ticker.isBlank()) {
            return dividendService.findByTicker(ticker);
        }
        return dividendService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a dividend record by id")
    public DividendResponse getById(@PathVariable Long id) {
        return dividendService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Record a dividend payment")
    public ResponseEntity<DividendResponse> create(@Valid @RequestBody CreateDividendRequest request) {
        DividendResponse response = dividendService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a dividend record")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        dividendService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/total")
    @Operation(summary = "Get total dividends received across all holdings")
    public Map<String, BigDecimal> getTotal() {
        return Map.of("totalDividendsReceived", dividendService.getTotalDividendsReceived());
    }
}

