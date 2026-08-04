package com.hsbc.portfoliomanager.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.hsbc.portfoliomanager.data.model.AssetType
import com.hsbc.portfoliomanager.data.model.displayName
import com.hsbc.portfoliomanager.ui.theme.*
import com.hsbc.portfoliomanager.ui.viewmodel.DashboardViewModel
import java.math.BigDecimal
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    onNavigateToHoldings: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedFilter by remember { mutableStateOf<AssetType?>(null) }
    
    LaunchedEffect(selectedFilter) {
        viewModel.loadDashboard(selectedFilter)
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Portfolio Dashboard",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = HSBCRed,
                    titleContentColor = Color.White
                ),
                actions = {
                    IconButton(onClick = { viewModel.loadDashboard(selectedFilter) }) {
                        Icon(
                            Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = Color.White
                        )
                    }
                }
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onNavigateToHoldings,
                icon = {
                    Icon(Icons.Default.List, contentDescription = null)
                },
                text = { Text("View Holdings") },
                containerColor = HSBCRed
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when {
                uiState.isLoading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = HSBCRed)
                    }
                }
                
                uiState.error != null -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(32.dp)
                        ) {
                            Icon(
                                Icons.Default.Warning,
                                contentDescription = null,
                                modifier = Modifier.size(64.dp),
                                tint = ErrorRed
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                uiState.error ?: "An error occurred",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.error
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = { viewModel.loadDashboard(selectedFilter) },
                                colors = ButtonDefaults.buttonColors(containerColor = HSBCRed)
                            ) {
                                Text("Retry")
                            }
                        }
                    }
                }
                
                uiState.dashboard != null -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Summary Cards
                        item {
                            DashboardSummaryCard(
                                dashboard = uiState.dashboard!!
                            )
                        }
                        
                        // Asset Type Filter
                        item {
                            AssetTypeFilterRow(
                                selectedType = selectedFilter,
                                onTypeSelected = { selectedFilter = it }
                            )
                        }
                        
                        // Asset Allocation
                        item {
                            AssetAllocationCard(
                                quantityByAssetType = uiState.dashboard!!.quantityByAssetType,
                                costByAssetType = uiState.dashboard!!.costByAssetType
                            )
                        }
                        
                        // Holdings List
                        if (uiState.dashboard!!.holdings.isNotEmpty()) {
                            item {
                                Text(
                                    "Your Holdings",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(vertical = 8.dp)
                                )
                            }
                            
                            items(uiState.dashboard!!.holdings) { item ->
                                HoldingItemCard(item)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DashboardSummaryCard(dashboard: com.hsbc.portfoliomanager.data.model.DashboardResponse) {
    val currencyFormat = NumberFormat.getCurrencyInstance(Locale.US)
    val isProfit = dashboard.unrealizedGainLoss >= BigDecimal.ZERO
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(HSBCRed, HSBCRedDark)
                    )
                )
                .padding(20.dp)
        ) {
            Column {
                Text(
                    "Total Portfolio Value",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White.copy(alpha = 0.9f)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    currencyFormat.format(dashboard.estimatedTotalValue),
                    style = MaterialTheme.typography.displaySmall,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            "Cost Basis",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.White.copy(alpha = 0.7f)
                        )
                        Text(
                            currencyFormat.format(dashboard.totalCostBasis),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White
                        )
                    }
                    
                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            "Gain/Loss",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.White.copy(alpha = 0.7f)
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                if (isProfit) Icons.Default.ArrowUpward else Icons.Default.ArrowDownward,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp),
                                tint = if (isProfit) AccentGreen else ErrorRed
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                currencyFormat.format(dashboard.unrealizedGainLoss),
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = if (isProfit) AccentGreen else ErrorRed
                            )
                            Text(
                                " (${String.format("%.2f", dashboard.unrealizedGainLossPct)}%)",
                                style = MaterialTheme.typography.bodyMedium,
                                color = if (isProfit) AccentGreen else ErrorRed
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                Divider(color = Color.White.copy(alpha = 0.3f))
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    StatsItem("Positions", dashboard.totalPositions.toString(), Icons.Default.AccountBalance)
                    StatsItem("Total Quantity", dashboard.totalQuantity.toString(), Icons.Default.QrCode)
                }
            }
        }
    }
}

@Composable
fun StatsItem(label: String, value: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            icon,
            contentDescription = null,
            tint = Color.White.copy(alpha = 0.8f),
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Column {
            Text(
                value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                label,
                style = MaterialTheme.typography.bodySmall,
                color = Color.White.copy(alpha = 0.7f)
            )
        }
    }
}

@Composable
fun AssetTypeFilterRow(
    selectedType: AssetType?,
    onTypeSelected: (AssetType?) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                "Filter by Asset Type",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = selectedType == null,
                    onClick = { onTypeSelected(null) },
                    label = { Text("All") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = HSBCRed,
                        selectedLabelColor = Color.White
                    )
                )
                AssetType.values().forEach { type ->
                    FilterChip(
                        selected = selectedType == type,
                        onClick = { onTypeSelected(if (selectedType == type) null else type) },
                        label = { Text(type.displayName()) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = HSBCRed,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
        }
    }
}

@Composable
fun AssetAllocationCard(
    quantityByAssetType: Map<String, Long>,
    costByAssetType: Map<String, BigDecimal>
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                "Asset Allocation",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(16.dp))
            
            quantityByAssetType.entries.forEachIndexed { index, entry ->
                val color = ChartColors[index % ChartColors.size]
                val cost = costByAssetType[entry.key] ?: BigDecimal.ZERO
                
                AllocationRow(
                    assetType = entry.key,
                    quantity = entry.value,
                    cost = cost,
                    color = color
                )
                if (index < quantityByAssetType.size - 1) {
                    Spacer(modifier = Modifier.height(12.dp))
                }
            }
        }
    }
}

@Composable
fun AllocationRow(assetType: String, quantity: Long, cost: BigDecimal, color: Color) {
    val currencyFormat = NumberFormat.getCurrencyInstance(Locale.US)
    
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(12.dp)
                .clip(RoundedCornerShape(6.dp))
                .background(color)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                assetType,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Medium
            )
            Text(
                "$quantity units",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary
            )
        }
        Text(
            currencyFormat.format(cost),
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
fun HoldingItemCard(item: com.hsbc.portfoliomanager.data.model.PortfolioItem) {
    val currencyFormat = NumberFormat.getCurrencyInstance(Locale.US)
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Asset Type Icon
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(
                        when (item.assetType) {
                            AssetType.STOCK -> SecondaryBlue.copy(alpha = 0.2f)
                            AssetType.BOND -> AccentOrange.copy(alpha = 0.2f)
                            AssetType.CRYPTO -> AccentPurple.copy(alpha = 0.2f)
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    when (item.assetType) {
                        AssetType.STOCK -> Icons.Default.TrendingUp
                        AssetType.BOND -> Icons.Default.AccountBalance
                        AssetType.CRYPTO -> Icons.Default.CurrencyBitcoin
                    },
                    contentDescription = null,
                    tint = when (item.assetType) {
                        AssetType.STOCK -> SecondaryBlue
                        AssetType.BOND -> AccentOrange
                        AssetType.CRYPTO -> AccentPurple
                    }
                )
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    item.ticker,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    "${item.quantity} shares • ${item.assetType.displayName()}",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                )
                Text(
                    "Purchase: ${currencyFormat.format(item.purchasePrice)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextHint
                )
            }
            
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    currencyFormat.format(item.purchasePrice.multiply(item.quantity.toBigDecimal())),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    item.purchaseDate,
                    style = MaterialTheme.typography.bodySmall,
                    color = TextHint
                )
            }
        }
    }
}

