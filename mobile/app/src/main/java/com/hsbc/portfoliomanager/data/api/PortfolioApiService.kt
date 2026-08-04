package com.hsbc.portfoliomanager.data.api

import com.hsbc.portfoliomanager.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface PortfolioApiService {
    
    // Portfolio Items
    @GET("portfolio-items")
    suspend fun getPortfolioItems(): Response<List<PortfolioItem>>
    
    @GET("portfolio-items/{id}")
    suspend fun getPortfolioItem(@Path("id") id: Long): Response<PortfolioItem>
    
    @POST("portfolio-items")
    suspend fun createPortfolioItem(@Body request: CreatePortfolioItemRequest): Response<PortfolioItem>
    
    @PUT("portfolio-items/{id}")
    suspend fun updatePortfolioItem(
        @Path("id") id: Long,
        @Body request: UpdatePortfolioItemRequest
    ): Response<PortfolioItem>
    
    @DELETE("portfolio-items/{id}")
    suspend fun deletePortfolioItem(@Path("id") id: Long): Response<Unit>
    
    @GET("portfolio-items/summary")
    suspend fun getPortfolioSummary(): Response<PortfolioSummary>
    
    // Dashboard
    @GET("dashboard")
    suspend fun getDashboard(): Response<DashboardResponse>
    
    @GET("dashboard/{assetType}")
    suspend fun getDashboardByAssetType(@Path("assetType") assetType: AssetType): Response<DashboardResponse>
}

