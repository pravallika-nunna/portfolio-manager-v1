package com.example.hsbcproject.dto;

import com.example.hsbcproject.domain.AssetType;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PortfolioItemResponse(
        Long id,
        String ticker,
        Integer quantity,
        AssetType assetType,
        BigDecimal purchasePrice,
        LocalDate purchaseDate) {
}

