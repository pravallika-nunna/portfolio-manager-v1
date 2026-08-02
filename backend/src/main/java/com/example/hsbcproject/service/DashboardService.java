package com.example.hsbcproject.service;

import com.example.hsbcproject.domain.AssetType;
import com.example.hsbcproject.domain.PortfolioItem;
import com.example.hsbcproject.dto.DashboardResponse;
import com.example.hsbcproject.dto.LivePriceResponse;
import com.example.hsbcproject.dto.PortfolioItemResponse;
import com.example.hsbcproject.repository.PortfolioItemRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final PortfolioItemRepository portfolioItemRepository;
    private final PriceService priceService;

    public DashboardService(PortfolioItemRepository portfolioItemRepository, PriceService priceService) {
        this.portfolioItemRepository = portfolioItemRepository;
        this.priceService = priceService;
    }

    public DashboardResponse getCombinedDashboard() {
        return buildDashboard(portfolioItemRepository.findAll());
    }

    public DashboardResponse getDashboardByAssetType(AssetType assetType) {
        List<PortfolioItem> items = portfolioItemRepository.findAll().stream()
                .filter(i -> i.getAssetType() == assetType)
                .toList();
        return buildDashboard(items);
    }

    private DashboardResponse buildDashboard(List<PortfolioItem> items) {
        BigDecimal totalCostBasis = BigDecimal.ZERO;
        BigDecimal totalCurrentValue = BigDecimal.ZERO;
        Map<String, Long> quantityByType = new HashMap<>();
        Map<String, BigDecimal> costByType = new HashMap<>();
        long totalQuantity = 0;

        for (PortfolioItem item : items) {
            BigDecimal cost = item.getPurchasePrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalCostBasis = totalCostBasis.add(cost);
            totalQuantity += item.getQuantity();

            String type = item.getAssetType().name();
            quantityByType.merge(type, (long) item.getQuantity(), Long::sum);
            costByType.merge(type, cost, BigDecimal::add);

            LivePriceResponse price = priceService.getPrice(item.getTicker());
            BigDecimal currentPrice = price.currentPrice() != null ? price.currentPrice() : item.getPurchasePrice();
            totalCurrentValue = totalCurrentValue.add(currentPrice.multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        BigDecimal gainLoss = totalCurrentValue.subtract(totalCostBasis);
        BigDecimal gainLossPct = totalCostBasis.compareTo(BigDecimal.ZERO) > 0
                ? gainLoss.divide(totalCostBasis, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<PortfolioItemResponse> responses = items.stream()
                .map(i -> new PortfolioItemResponse(i.getId(), i.getTicker(), i.getQuantity(),
                        i.getAssetType(), i.getPurchasePrice(), i.getPurchaseDate()))
                .toList();

        return new DashboardResponse(items.size(), totalQuantity,
                totalCostBasis.setScale(2, RoundingMode.HALF_UP),
                totalCurrentValue.setScale(2, RoundingMode.HALF_UP),
                gainLoss.setScale(2, RoundingMode.HALF_UP),
                gainLossPct, quantityByType, costByType, responses);
    }
}

