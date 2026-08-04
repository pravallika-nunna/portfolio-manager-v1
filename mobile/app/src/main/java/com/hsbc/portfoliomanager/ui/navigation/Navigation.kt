package com.hsbc.portfoliomanager.ui.navigation

import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.hsbc.portfoliomanager.ui.screens.DashboardScreen
import com.hsbc.portfoliomanager.ui.screens.HoldingsScreen
import com.hsbc.portfoliomanager.ui.viewmodel.DashboardViewModel
import com.hsbc.portfoliomanager.ui.viewmodel.PortfolioViewModel

sealed class Screen(val route: String) {
    object Dashboard : Screen("dashboard")
    object Holdings : Screen("holdings")
}

@Composable
fun PortfolioNavigation() {
    val navController = rememberNavController()
    val dashboardViewModel: DashboardViewModel = viewModel()
    val portfolioViewModel: PortfolioViewModel = viewModel()
    
    NavHost(
        navController = navController,
        startDestination = Screen.Dashboard.route
    ) {
        composable(Screen.Dashboard.route) {
            DashboardScreen(
                viewModel = dashboardViewModel,
                onNavigateToHoldings = {
                    navController.navigate(Screen.Holdings.route)
                }
            )
        }
        
        composable(Screen.Holdings.route) {
            HoldingsScreen(
                viewModel = portfolioViewModel,
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}

