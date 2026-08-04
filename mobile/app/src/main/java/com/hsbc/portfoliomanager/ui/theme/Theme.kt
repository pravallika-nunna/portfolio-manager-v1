package com.hsbc.portfoliomanager.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = HSBCRed,
    onPrimary = TextOnPrimary,
    primaryContainer = HSBCRedDark,
    onPrimaryContainer = TextOnPrimary,
    secondary = SecondaryBlue,
    onSecondary = TextOnPrimary,
    secondaryContainer = SecondaryBlueDark,
    onSecondaryContainer = TextOnPrimary,
    tertiary = AccentPurple,
    background = BackgroundDark,
    onBackground = Color(0xFFE0E0E0),
    surface = SurfaceDark,
    onSurface = Color(0xFFE0E0E0),
    error = ErrorRed,
    onError = TextOnPrimary
)

private val LightColorScheme = lightColorScheme(
    primary = HSBCRed,
    onPrimary = TextOnPrimary,
    primaryContainer = HSBCRedLight,
    onPrimaryContainer = TextPrimary,
    secondary = SecondaryBlue,
    onSecondary = TextOnPrimary,
    secondaryContainer = SecondaryBlueLight,
    onSecondaryContainer = TextPrimary,
    tertiary = AccentPurple,
    background = BackgroundLight,
    onBackground = TextPrimary,
    surface = SurfaceLight,
    onSurface = TextPrimary,
    error = ErrorRed,
    onError = TextOnPrimary
)

@Composable
fun PortfolioManagerTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

