package com.hsbc.portfoliomanager.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hsbc.portfoliomanager.data.model.*
import com.hsbc.portfoliomanager.data.repository.ApiResult
import com.hsbc.portfoliomanager.data.repository.PortfolioRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PortfolioUiState(
    val isLoading: Boolean = false,
    val items: List<PortfolioItem> = emptyList(),
    val error: String? = null,
    val successMessage: String? = null
)

class PortfolioViewModel : ViewModel() {
    
    private val repository = PortfolioRepository()
    
    private val _uiState = MutableStateFlow(PortfolioUiState())
    val uiState: StateFlow<PortfolioUiState> = _uiState.asStateFlow()
    
    init {
        loadPortfolioItems()
    }
    
    fun loadPortfolioItems() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            when (val result = repository.getPortfolioItems()) {
                is ApiResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        items = result.data,
                        error = null
                    )
                }
                is ApiResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.message
                    )
                }
                else -> {}
            }
        }
    }
    
    fun createPortfolioItem(request: CreatePortfolioItemRequest) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            when (val result = repository.createPortfolioItem(request)) {
                is ApiResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Portfolio item created successfully"
                    )
                    loadPortfolioItems()
                }
                is ApiResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.message
                    )
                }
                else -> {}
            }
        }
    }
    
    fun updatePortfolioItem(id: Long, request: UpdatePortfolioItemRequest) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            when (val result = repository.updatePortfolioItem(id, request)) {
                is ApiResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Portfolio item updated successfully"
                    )
                    loadPortfolioItems()
                }
                is ApiResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.message
                    )
                }
                else -> {}
            }
        }
    }
    
    fun deletePortfolioItem(id: Long) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            when (val result = repository.deletePortfolioItem(id)) {
                is ApiResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        successMessage = "Portfolio item deleted successfully"
                    )
                    loadPortfolioItems()
                }
                is ApiResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.message
                    )
                }
                else -> {}
            }
        }
    }
    
    fun clearMessages() {
        _uiState.value = _uiState.value.copy(error = null, successMessage = null)
    }
}

