package com.hsbc.portfoliomanager.data.model

import com.google.gson.annotations.SerializedName
import java.math.BigDecimal

data class PortfolioItem(
    @SerializedName("id")
    val id: Long,
    
    @SerializedName("ticker")
    val ticker: String,
    
    @SerializedName("quantity")
    val quantity: Int,
    
    @SerializedName("assetType")
    val assetType: AssetType,
    
    @SerializedName("purchasePrice")
    val purchasePrice: BigDecimal,
    
    @SerializedName("purchaseDate")
    val purchaseDate: String
)

data class CreatePortfolioItemRequest(
    @SerializedName("ticker")
    val ticker: String,
    
    @SerializedName("quantity")
    val quantity: Int,
    
    @SerializedName("assetType")
    val assetType: AssetType,
    
    @SerializedName("purchasePrice")
    val purchasePrice: BigDecimal,
    
    @SerializedName("purchaseDate")
    val purchaseDate: String
)

data class UpdatePortfolioItemRequest(
    @SerializedName("ticker")
    val ticker: String,
    
    @SerializedName("quantity")
    val quantity: Int,
    
    @SerializedName("assetType")
    val assetType: AssetType,
    
    @SerializedName("purchasePrice")
    val purchasePrice: BigDecimal,
    
    @SerializedName("purchaseDate")
    val purchaseDate: String
)

