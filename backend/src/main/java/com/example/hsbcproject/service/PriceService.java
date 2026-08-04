package com.example.hsbcproject.service;

import com.example.hsbcproject.dto.LivePriceResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import yahoofinance.Stock;
import yahoofinance.YahooFinance;

@Service
public class PriceService {

    private static final Logger log = LoggerFactory.getLogger(PriceService.class);
    private static final String FALLBACK_BASE_URL =
            "https://c4rm9elh30.execute-api.us-east-1.amazonaws.com/default/cachedPriceData";

    private final RestClient fallbackClient;

    public PriceService() {
        this.fallbackClient = RestClient.builder().baseUrl(FALLBACK_BASE_URL).build();
    }

    public LivePriceResponse getPrice(String ticker) {
        String normalizedTicker = ticker == null ? "" : ticker.trim().toUpperCase();

        try {
            Stock stock = YahooFinance.get(normalizedTicker);
            if (stock != null && stock.getQuote() != null && stock.getQuote().getPrice() != null) {
                BigDecimal price = stock.getQuote().getPrice();
                BigDecimal change = stock.getQuote().getChange();
                BigDecimal changePercent = stock.getQuote().getChangeInPercent();
                return new LivePriceResponse(normalizedTicker, price, change, changePercent, null);
            }

            return tryFallback(normalizedTicker, "Live quote not returned by Yahoo");
        } catch (IOException e) {
            log.warn("Yahoo price fetch failed for {}: {}", normalizedTicker, e.getMessage());
            return tryFallback(normalizedTicker, "Yahoo unavailable (possibly rate-limited)");
        } catch (RuntimeException e) {
            log.warn("Unexpected Yahoo error for {}: {}", normalizedTicker, e.getMessage());
            return tryFallback(normalizedTicker, "Yahoo unavailable");
        }
    }

    private LivePriceResponse tryFallback(String ticker, String fallbackReason) {
        try {
            Map<String, Object> response = fallbackClient.get()
                    .uri("?ticker={ticker}", ticker)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (response == null) {
<<<<<<< HEAD
                return new LivePriceResponse(ticker, null, null, null,
                        fallbackReason + ". Fallback returned no data.");
=======
                return new LivePriceResponse(ticker.toUpperCase(), null, null, null, "No data returned");
>>>>>>> f5b6b6859b2642cfe0b4b144e35c389411c3f488
            }

            // API returns { ticker, price_data: { close: [...], open: [...], high: [...], low: [...], volume: [...] } }
            // Latest price = last element of close array
            @SuppressWarnings("unchecked")
            Map<String, Object> priceData = (Map<String, Object>) response.get("price_data");
            if (priceData == null) {
                return new LivePriceResponse(ticker.toUpperCase(), null, null, null, "price_data missing in response");
            }

<<<<<<< HEAD
            if (price != null) {
                return new LivePriceResponse(
                        ticker,
                        price,
                        change,
                        changePercent,
                        fallbackReason + ". Showing cached fallback price.");
            }

            return new LivePriceResponse(ticker, null, null, null,
                    fallbackReason + ". Ticker not available in fallback cache.");
=======
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
>>>>>>> f5b6b6859b2642cfe0b4b144e35c389411c3f488
        } catch (Exception e) {
            log.warn("Fallback price fetch failed for {}: {}", ticker, e.getMessage());
            return new LivePriceResponse(ticker, null, null, null,
                    fallbackReason + ". Fallback also unavailable: " + e.getMessage());
        }
    }
<<<<<<< HEAD

    @SuppressWarnings("unchecked")
    private BigDecimal extractBigDecimal(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value instanceof Number n) {
            return BigDecimal.valueOf(n.doubleValue());
        }
        if (value instanceof Map<?, ?> nested) {
            Object raw = ((Map<String, Object>) nested).get("raw");
            if (raw instanceof Number n) {
                return BigDecimal.valueOf(n.doubleValue());
            }
        }
        return null;
    }
=======
>>>>>>> f5b6b6859b2642cfe0b4b144e35c389411c3f488
}
