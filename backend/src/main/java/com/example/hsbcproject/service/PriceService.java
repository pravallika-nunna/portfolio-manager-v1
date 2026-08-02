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
                return new LivePriceResponse(ticker, null, null, null, "No data returned");
            }

            BigDecimal price = extractBigDecimal(response, "price");
            BigDecimal change = extractBigDecimal(response, "change");
            BigDecimal changePercent = extractBigDecimal(response, "changePercent");

            return new LivePriceResponse(ticker.toUpperCase(), price, change, changePercent, null);
        } catch (Exception e) {
            log.warn("Could not fetch live price for {}: {}", ticker, e.getMessage());
            return new LivePriceResponse(ticker.toUpperCase(), null, null, null,
                    "Price unavailable: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private BigDecimal extractBigDecimal(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value instanceof Number n) {
            return BigDecimal.valueOf(n.doubleValue());
        }
        if (value instanceof Map<?, ?> nested) {
            Object raw = ((Map<String, Object>) nested).get("raw");
            if (raw instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        }
        return null;
    }
}

