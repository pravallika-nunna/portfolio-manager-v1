package com.example.hsbcproject.service;

import com.example.hsbcproject.domain.PortfolioItem;
import com.example.hsbcproject.dto.CreatePortfolioItemRequest;
import com.example.hsbcproject.dto.PortfolioItemResponse;
import com.example.hsbcproject.dto.PortfolioSummaryResponse;
import com.example.hsbcproject.dto.UpdatePortfolioItemRequest;
import com.example.hsbcproject.exception.ResourceNotFoundException;
import com.example.hsbcproject.repository.PortfolioItemRepository;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PortfolioItemService {

    private final PortfolioItemRepository portfolioItemRepository;

    public PortfolioItemService(PortfolioItemRepository portfolioItemRepository) {
        this.portfolioItemRepository = portfolioItemRepository;
    }

    @Transactional(readOnly = true)
    public List<PortfolioItemResponse> findAll() {
        return portfolioItemRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PortfolioItemResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    public PortfolioItemResponse create(CreatePortfolioItemRequest request) {
        PortfolioItem item = new PortfolioItem();
        item.setTicker(request.ticker().toUpperCase());
        item.setQuantity(request.quantity());
        item.setAssetType(request.assetType());
        item.setPurchasePrice(request.purchasePrice());
        item.setPurchaseDate(request.purchaseDate());
        return toResponse(portfolioItemRepository.save(item));
    }

    public PortfolioItemResponse update(Long id, UpdatePortfolioItemRequest request) {
        PortfolioItem item = getEntity(id);
        item.setTicker(request.ticker().toUpperCase());
        item.setQuantity(request.quantity());
        item.setAssetType(request.assetType());
        item.setPurchasePrice(request.purchasePrice());
        item.setPurchaseDate(request.purchaseDate());
        return toResponse(portfolioItemRepository.save(item));
    }

    public void delete(Long id) {
        PortfolioItem item = getEntity(id);
        portfolioItemRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public PortfolioSummaryResponse getSummary() {
        List<PortfolioItem> items = portfolioItemRepository.findAll();
        Map<String, Long> quantityByType = new HashMap<>();
        Map<String, BigDecimal> costByType = new HashMap<>();
        long totalQuantity = 0;
        BigDecimal totalCostBasis = BigDecimal.ZERO;

        for (PortfolioItem item : items) {
            totalQuantity += item.getQuantity();
            BigDecimal itemCost = item.getPurchasePrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalCostBasis = totalCostBasis.add(itemCost);
            String key = item.getAssetType().name();
            quantityByType.put(key, quantityByType.getOrDefault(key, 0L) + item.getQuantity());
            costByType.merge(key, itemCost, BigDecimal::add);
        }

        return new PortfolioSummaryResponse(items.size(), totalQuantity, totalCostBasis, quantityByType, costByType);
    }

    public PortfolioItem getEntity(Long id) {
        return portfolioItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio item with id " + id + " was not found"));
    }

    private PortfolioItemResponse toResponse(PortfolioItem item) {
        return new PortfolioItemResponse(item.getId(), item.getTicker(), item.getQuantity(),
                item.getAssetType(), item.getPurchasePrice(), item.getPurchaseDate());
    }
}
