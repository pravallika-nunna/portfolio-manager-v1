package com.hsbc.portfoliomanager.data.repository

import com.hsbc.portfoliomanager.data.api.ApiClient
import com.hsbc.portfoliomanager.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

sealed class ApiResult<out T> {
    data class Success<T>(val data: T) : ApiResult<T>()
    data class Error(val message: String) : ApiResult<Nothing>()
    object Loading : ApiResult<Nothing>()
}

class PortfolioRepository {
    
    private val api = ApiClient.portfolioApi
    
    suspend fun getPortfolioItems(): ApiResult<List<PortfolioItem>> = withContext(Dispatchers.IO) {
        try {
            val response = api.getPortfolioItems()
            if (response.isSuccessful && response.body() != null) {
                ApiResult.Success(response.body()!!)
            } else {
                ApiResult.Error(response.message() ?: "Failed to fetch portfolio items")
            }
        } catch (e: Exception) {
            ApiResult.Error(e.message ?: "Network error occurred")
        }
    }
    
    suspend fun getPortfolioItem(id: Long): ApiResult<PortfolioItem> = withContext(Dispatchers.IO) {
        try {
            val response = api.getPortfolioItem(id)
            if (response.isSuccessful && response.body() != null) {
                ApiResult.Success(response.body()!!)
            } else {
                ApiResult.Error(response.message() ?: "Failed to fetch portfolio item")
            }
        } catch (e: Exception) {
            ApiResult.Error(e.message ?: "Network error occurred")
        }
    }
    
    suspend fun createPortfolioItem(request: CreatePortfolioItemRequest): ApiResult<PortfolioItem> = 
        withContext(Dispatchers.IO) {
            try {
                val response = api.createPortfolioItem(request)
                if (response.isSuccessful && response.body() != null) {
                    ApiResult.Success(response.body()!!)
                } else {
                    ApiResult.Error(response.message() ?: "Failed to create portfolio item")
                }
            } catch (e: Exception) {
                ApiResult.Error(e.message ?: "Network error occurred")
            }
        }
    
    suspend fun updatePortfolioItem(id: Long, request: UpdatePortfolioItemRequest): ApiResult<PortfolioItem> = 
        withContext(Dispatchers.IO) {
            try {
                val response = api.updatePortfolioItem(id, request)
                if (response.isSuccessful && response.body() != null) {
                    ApiResult.Success(response.body()!!)
                } else {
                    ApiResult.Error(response.message() ?: "Failed to update portfolio item")
                }
            } catch (e: Exception) {
                ApiResult.Error(e.message ?: "Network error occurred")
            }
        }
    
    suspend fun deletePortfolioItem(id: Long): ApiResult<Unit> = withContext(Dispatchers.IO) {
        try {
            val response = api.deletePortfolioItem(id)
            if (response.isSuccessful) {
                ApiResult.Success(Unit)
            } else {
                ApiResult.Error(response.message() ?: "Failed to delete portfolio item")
            }
        } catch (e: Exception) {
            ApiResult.Error(e.message ?: "Network error occurred")
        }
    }
    
    suspend fun getPortfolioSummary(): ApiResult<PortfolioSummary> = withContext(Dispatchers.IO) {
        try {
            val response = api.getPortfolioSummary()
            if (response.isSuccessful && response.body() != null) {
                ApiResult.Success(response.body()!!)
            } else {
                ApiResult.Error(response.message() ?: "Failed to fetch portfolio summary")
            }
        } catch (e: Exception) {
            ApiResult.Error(e.message ?: "Network error occurred")
        }
    }
    
    suspend fun getDashboard(): ApiResult<DashboardResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.getDashboard()
            if (response.isSuccessful && response.body() != null) {
                ApiResult.Success(response.body()!!)
            } else {
                ApiResult.Error(response.message() ?: "Failed to fetch dashboard")
            }
        } catch (e: Exception) {
            ApiResult.Error(e.message ?: "Network error occurred")
        }
    }
    
    suspend fun getDashboardByAssetType(assetType: AssetType): ApiResult<DashboardResponse> = 
        withContext(Dispatchers.IO) {
            try {
                val response = api.getDashboardByAssetType(assetType)
                if (response.isSuccessful && response.body() != null) {
                    ApiResult.Success(response.body()!!)
                } else {
                    ApiResult.Error(response.message() ?: "Failed to fetch dashboard")
                }
            } catch (e: Exception) {
                ApiResult.Error(e.message ?: "Network error occurred")
            }
        }
}

