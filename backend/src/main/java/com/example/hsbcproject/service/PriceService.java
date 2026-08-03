package com.example.hsbcproject.service;

import com.example.hsbcproject.dto.LivePriceResponse;
import java.math.BigDecimal;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class PriceService {

    private static final Logger log = LoggerFactory.getLogger(PriceService.class);
    private static final String BASE_URL =
            "https://c4rm9elh30.execute-api.us-east-1.amazonaws.com/default/cachedPriceData";

    private final RestClient restClient;

    public PriceService() {
        this.restClient = RestClient.builder().baseUrl(BASE_URL).build();
    }

    public LivePriceResponse getPrice(String ticker) {
        try {
            Map<String, Object> response = restClient.get()
                    .uri("?ticker={ticker}", ticker.toUpperCase())
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (response == null) {
                return new LivePriceResponse(ticker.toUpperCase(), null, null, null, "No data returned");
            }

            // API returns { ticker, price_data: { close: [...], open: [...], high: [...], low: [...], volume: [...] } }
            // Latest price = last element of close array
            @SuppressWarnings("unchecked")
            Map<String, Object> priceData = (Map<String, Object>) response.get("price_data");
            if (priceData == null) {
                return new LivePriceResponse(ticker.toUpperCase(), null, null, null, "price_data missing in response");
            }

            @SuppressWarnings("unchecked")
            java.util.List<Number> closeList = (java.util.List<Number>) priceData.get("close");
            if (closeList == null || closeList.isEmpty()) {
                return new LivePriceResponse(ticker.toUpperCase(), null, null, null, "No close data in response");
            }

            BigDecimal currentPrice = BigDecimal.valueOf(closeList.get(closeList.size() - 1).doubleValue());
            BigDecimal change = null;
            BigDecimal changePercent = null;

            if (closeList.size() >= 2) {
                BigDecimal previousPrice = BigDecimal.valueOf(closeList.get(closeList.size() - 2).doubleValue());
                change = currentPrice.subtract(previousPrice).setScale(4, java.math.RoundingMode.HALF_UP);
                changePercent = previousPrice.compareTo(BigDecimal.ZERO) != 0
                        ? change.divide(previousPrice, 4, java.math.RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100)).setScale(2, java.math.RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;
            }

            return new LivePriceResponse(ticker.toUpperCase(), currentPrice, change, changePercent, null);
        } catch (Exception e) {
            log.warn("Could not fetch live price for {}: {}", ticker, e.getMessage());
            return new LivePriceResponse(ticker.toUpperCase(), null, null, null,
                    "Price unavailable: " + e.getMessage());
        }
    }
}

