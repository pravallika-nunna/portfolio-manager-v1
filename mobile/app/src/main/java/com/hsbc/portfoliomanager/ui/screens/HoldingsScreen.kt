package com.hsbc.portfoliomanager.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.hsbc.portfoliomanager.data.model.*
import com.hsbc.portfoliomanager.ui.theme.*
import com.hsbc.portfoliomanager.ui.viewmodel.PortfolioViewModel
import java.math.BigDecimal
import java.text.NumberFormat
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HoldingsScreen(
    viewModel: PortfolioViewModel,
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }
    var itemToEdit by remember { mutableStateOf<PortfolioItem?>(null) }
    var itemToDelete by remember { mutableStateOf<PortfolioItem?>(null) }
    
    // Handle messages
    LaunchedEffect(uiState.successMessage, uiState.error) {
        if (uiState.successMessage != null || uiState.error != null) {
            kotlinx.coroutines.delay(3000)
            viewModel.clearMessages()
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Holdings Management") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = HSBCRed,
                    titleContentColor = Color.White
                ),
                actions = {
                    IconButton(onClick = { viewModel.loadPortfolioItems() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = Color.White)
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = HSBCRed
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Item", tint = Color.White)
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            Column {
                // Messages
                AnimatedVisibility(visible = uiState.successMessage != null) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        colors = CardDefaults.cardColors(containerColor = AccentGreen.copy(alpha = 0.1f))
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = AccentGreen)
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(uiState.successMessage ?: "", color = AccentGreen)
                        }
                    }
                }
                
                AnimatedVisibility(visible = uiState.error != null) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        colors = CardDefaults.cardColors(containerColor = ErrorRed.copy(alpha = 0.1f))
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Error, contentDescription = null, tint = ErrorRed)
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(uiState.error ?: "", color = ErrorRed)
                        }
                    }
                }
                
                when {
                    uiState.isLoading -> {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(color = HSBCRed)
                        }
                    }
                    
                    uiState.items.isEmpty() -> {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.padding(32.dp)
                            ) {
                                Icon(
                                    Icons.Default.AttachMoney,
                                    contentDescription = null,
                                    modifier = Modifier.size(64.dp),
                                    tint = TextHint
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                Text(
                                    "No holdings yet",
                                    style = MaterialTheme.typography.titleLarge,
                                    color = TextSecondary
                                )
                                Text(
                                    "Tap + to add your first investment",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = TextHint
                                )
                            }
                        }
                    }
                    
                    else -> {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(uiState.items) { item ->
                                HoldingManagementCard(
                                    item = item,
                                    onEdit = { itemToEdit = item },
                                    onDelete = { itemToDelete = item }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Dialogs
    if (showAddDialog) {
        AddEditPortfolioDialog(
            item = null,
            onDismiss = { showAddDialog = false },
            onSave = { request ->
                viewModel.createPortfolioItem(request)
                showAddDialog = false
            }
        )
    }
    
    itemToEdit?.let { item ->
        AddEditPortfolioDialog(
            item = item,
            onDismiss = { itemToEdit = null },
            onSave = { request ->
                viewModel.updatePortfolioItem(item.id, UpdatePortfolioItemRequest(
                    ticker = request.ticker,
                    quantity = request.quantity,
                    assetType = request.assetType,
                    purchasePrice = request.purchasePrice,
                    purchaseDate = request.purchaseDate
                ))
                itemToEdit = null
            }
        )
    }
    
    itemToDelete?.let { item ->
        DeleteConfirmationDialog(
            item = item,
            onDismiss = { itemToDelete = null },
            onConfirm = {
                viewModel.deletePortfolioItem(item.id)
                itemToDelete = null
            }
        )
    }
}

@Composable
fun HoldingManagementCard(
    item: PortfolioItem,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val currencyFormat = NumberFormat.getCurrencyInstance(Locale.US)
    val totalValue = item.purchasePrice.multiply(item.quantity.toBigDecimal())
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Icon
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
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        item.assetType.displayName(),
                        style = MaterialTheme.typography.bodySmall,
                        color = TextSecondary
                    )
                }
                
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        currencyFormat.format(totalValue),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = HSBCRed
                    )
                    Text(
                        "Total Value",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextHint
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            Divider()
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                DetailItem("Quantity", item.quantity.toString())
                DetailItem("Price", currencyFormat.format(item.purchasePrice))
                DetailItem("Date", LocalDate.parse(item.purchaseDate).format(DateTimeFormatter.ofPattern("MMM dd, yyyy")))
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onEdit) {
                    Icon(Icons.Default.Edit, contentDescription = "Edit", tint = SecondaryBlue)
                }
                IconButton(onClick = onDelete) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = ErrorRed)
                }
            }
        }
    }
}

@Composable
fun DetailItem(label: String, value: String) {
    Column {
        Text(
            label,
            style = MaterialTheme.typography.bodySmall,
            color = TextHint
        )
        Text(
            value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddEditPortfolioDialog(
    item: PortfolioItem?,
    onDismiss: () -> Unit,
    onSave: (CreatePortfolioItemRequest) -> Unit
) {
    var ticker by remember { mutableStateOf(item?.ticker ?: "") }
    var quantity by remember { mutableStateOf(item?.quantity?.toString() ?: "") }
    var assetType by remember { mutableStateOf(item?.assetType ?: AssetType.STOCK) }
    var price by remember { mutableStateOf(item?.purchasePrice?.toString() ?: "") }
    var date by remember { mutableStateOf(item?.purchaseDate ?: LocalDate.now().toString()) }
    var expanded by remember { mutableStateOf(false) }
    
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
            ) {
                Text(
                    if (item == null) "Add New Holding" else "Edit Holding",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                OutlinedTextField(
                    value = ticker,
                    onValueChange = { ticker = it.uppercase() },
                    label = { Text("Ticker Symbol") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                ExposedDropdownMenuBox(
                    expanded = expanded,
                    onExpandedChange = { expanded = !expanded }
                ) {
                    OutlinedTextField(
                        value = assetType.displayName(),
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Asset Type") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = expanded,
                        onDismissRequest = { expanded = false }
                    ) {
                        AssetType.values().forEach { type ->
                            DropdownMenuItem(
                                text = { Text(type.displayName()) },
                                onClick = {
                                    assetType = type
                                    expanded = false
                                }
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = quantity,
                    onValueChange = { if (it.isEmpty() || it.toIntOrNull() != null) quantity = it },
                    label = { Text("Quantity") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = price,
                    onValueChange = { price = it },
                    label = { Text("Purchase Price") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    leadingIcon = { Text("$") }
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = date,
                    onValueChange = { date = it },
                    label = { Text("Purchase Date (YYYY-MM-DD)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            try {
                                val request = CreatePortfolioItemRequest(
                                    ticker = ticker.trim(),
                                    quantity = quantity.toInt(),
                                    assetType = assetType,
                                    purchasePrice = BigDecimal(price),
                                    purchaseDate = date
                                )
                                onSave(request)
                            } catch (e: Exception) {
                                // Handle validation error
                            }
                        },
                        enabled = ticker.isNotBlank() && quantity.isNotBlank() && 
                                 price.isNotBlank() && date.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(containerColor = HSBCRed)
                    ) {
                        Text(if (item == null) "Add" else "Update")
                    }
                }
            }
        }
    }
}

@Composable
fun DeleteConfirmationDialog(
    item: PortfolioItem,
    onDismiss: () -> Unit,
    onConfirm: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = {
            Icon(Icons.Default.Warning, contentDescription = null, tint = ErrorRed)
        },
        title = {
            Text("Delete Holding?", fontWeight = FontWeight.Bold)
        },
        text = {
            Text("Are you sure you want to delete ${item.ticker}? This action cannot be undone.")
        },
        confirmButton = {
            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(containerColor = ErrorRed)
            ) {
                Text("Delete")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

