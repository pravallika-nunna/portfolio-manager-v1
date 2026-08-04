package com.example.hsbcproject;

import com.example.hsbcproject.domain.AssetType;
import com.example.hsbcproject.domain.PortfolioItem;
import com.example.hsbcproject.dto.CreatePortfolioItemRequest;
import com.example.hsbcproject.dto.PortfolioSummaryResponse;
import com.example.hsbcproject.dto.UpdatePortfolioItemRequest;
import com.example.hsbcproject.dto.PortfolioItemResponse;
import com.example.hsbcproject.repository.PortfolioItemRepository;
import com.example.hsbcproject.service.PortfolioItemService;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
class PortfolioItemControllerTest {

    @Autowired
    private PortfolioItemService service;

    @Autowired
    private PortfolioItemRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    void createUpdateDeleteFlowWorks() {
        PortfolioItemResponse created = service.create(new CreatePortfolioItemRequest(
                "AAPL", 12, AssetType.STOCK, BigDecimal.valueOf(150.00), LocalDate.of(2024, 1, 15),
                "Apple Inc.", "Technology", null, null, null));
        assertEquals("AAPL", created.ticker());
        assertEquals(1, service.findAll().size());

        PortfolioItemResponse updated = service.update(
                created.id(),
                new UpdatePortfolioItemRequest("AAPL", 20, AssetType.STOCK,
                        BigDecimal.valueOf(155.00), LocalDate.of(2024, 1, 15),
                        "Apple Inc.", "Technology", null, null, null));
        assertEquals(20, updated.quantity());

        service.delete(created.id());
        assertEquals(0, service.findAll().size());
    }

    @Test
    void summaryAggregatesQuantitiesByType() {
        service.create(new CreatePortfolioItemRequest(
                "AAPL", 10, AssetType.STOCK, BigDecimal.valueOf(160.00), LocalDate.of(2024, 3, 20),
                "Apple Inc.", "Technology", null, null, null));
        service.create(new CreatePortfolioItemRequest(
                "BND", 7, AssetType.BOND, BigDecimal.valueOf(50.00), LocalDate.of(2024, 6, 1),
                "Vanguard Total Bond Market ETF", null, "Vanguard", BigDecimal.valueOf(3.5), LocalDate.of(2030, 6, 1)));

        PortfolioSummaryResponse summary = service.getSummary();
        assertEquals(2, summary.totalPositions());
        assertEquals(17, summary.totalQuantity());
        assertEquals(10L, summary.quantityByAssetType().get("STOCK"));
        assertEquals(7L, summary.quantityByAssetType().get("BOND"));
        assertEquals(new BigDecimal("1950.00"), summary.totalCostBasis().setScale(2));
    }

    @Test
    void deletingUnknownItemThrowsException() {
        assertThrows(RuntimeException.class, () -> service.delete(999L));
    }
}
