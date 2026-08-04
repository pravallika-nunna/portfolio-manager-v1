# Portfolio Tracking Feature - Complete Documentation

## 🎯 Overview

The Portfolio Tracking feature allows users to monitor their portfolio performance over time with **Daily, Weekly, Monthly, and Yearly** views. The system automatically captures portfolio snapshots and provides comprehensive performance metrics.

## 📊 Features

### 1. **Time Period Toggles**
- ✅ **Daily View** - Last 30 days of portfolio performance
- ✅ **Weekly View** - Last 12 weeks of portfolio performance
- ✅ **Monthly View** - Last 12 months of portfolio performance
- ✅ **Yearly View** - Last 5 years of portfolio performance

### 2. **Performance Metrics**
- Current portfolio value
- Previous period value
- Period change (amount and percentage)
- Highest value in period (with date)
- Lowest value in period (with date)
- Visual trend indicators

### 3. **Snapshot Management**
- Automatic snapshot creation
- Manual snapshot trigger
- Historical data storage
- Data visualization

## 🏗️ Architecture

### Backend Components

#### Domain Layer
```
TrackingPeriod.java         // Enum: DAILY, WEEKLY, MONTHLY, YEARLY
PortfolioSnapshot.java      // Entity for storing snapshots
```

#### Repository Layer
```
PortfolioSnapshotRepository.java  // JPA repository with custom queries
```

#### Service Layer
```
PortfolioTrackingService.java     // Business logic and calculations
```

#### Controller Layer
```
PortfolioTrackingController.java  // REST API endpoints
```

#### DTO Layer
```
PortfolioSnapshotResponse.java    // Snapshot data transfer
PortfolioTrackingResponse.java    // Tracking data with metrics
```

### Mobile Components

#### Data Layer
```kotlin
TrackingPeriod.kt           // Enum with display names
PortfolioTracking.kt        // Data models
```

#### API Layer
```kotlin
PortfolioApiService.kt      // Tracking endpoints
PortfolioRepository.kt      // Data access methods
```

#### UI Layer
```kotlin
TrackingViewModel.kt        // State management
TrackingScreen.kt          // UI with toggles and charts
```

## 🔌 API Endpoints

### Base URL: `/api/portfolio-tracking`

#### 1. Create Snapshot
```http
POST /api/portfolio-tracking/snapshot
```
Creates a snapshot of current portfolio state.

**Response:**
```json
{
  "id": 1,
  "snapshotDate": "2026-08-04",
  "totalValue": 16500.00,
  "totalCostBasis": 15000.00,
  "totalGainLoss": 1500.00,
  "totalGainLossPct": 10.00,
  "totalPositions": 5,
  "totalQuantity": 100
}
```

#### 2. Get Daily Tracking
```http
GET /api/portfolio-tracking/daily
```
Returns last 30 days of portfolio performance.

#### 3. Get Weekly Tracking
```http
GET /api/portfolio-tracking/weekly
```
Returns last 12 weeks of portfolio performance.

#### 4. Get Monthly Tracking
```http
GET /api/portfolio-tracking/monthly
```
Returns last 12 months of portfolio performance.

#### 5. Get Yearly Tracking
```http
GET /api/portfolio-tracking/yearly
```
Returns last 5 years of portfolio performance.

#### 6. Get Tracking by Period
```http
GET /api/portfolio-tracking/period/{period}
```
**Parameters:**
- `period`: DAILY, WEEKLY, MONTHLY, or YEARLY

#### 7. Get All Snapshots
```http
GET /api/portfolio-tracking/snapshots
```
Returns all historical snapshots.

### Response Format

All tracking endpoints return:
```json
{
  "period": "MONTHLY",
  "snapshots": [
    {
      "id": 1,
      "snapshotDate": "2026-07-04",
      "totalValue": 15000.00,
      "totalCostBasis": 14000.00,
      "totalGainLoss": 1000.00,
      "totalGainLossPct": 7.14,
      "totalPositions": 4,
      "totalQuantity": 90
    }
  ],
  "metrics": {
    "periodLabel": "Last 12 Months",
    "currentValue": 16500.00,
    "previousValue": 15000.00,
    "periodChange": 1500.00,
    "periodChangePct": 10.00,
    "highestValue": 17000.00,
    "lowestValue": 14500.00,
    "highestDate": "2026-08-01",
    "lowestDate": "2026-01-15"
  }
}
```

## 💾 Database Schema

### portfolio_snapshots Table

```sql
CREATE TABLE portfolio_snapshots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    snapshot_date DATE NOT NULL UNIQUE,
    total_value DECIMAL(15, 2) NOT NULL,
    total_cost_basis DECIMAL(15, 2) NOT NULL,
    total_gain_loss DECIMAL(15, 2) NOT NULL,
    total_gain_loss_pct DECIMAL(10, 4) NOT NULL,
    total_positions BIGINT NOT NULL,
    total_quantity BIGINT NOT NULL,
    created_at DATE NOT NULL,
    INDEX idx_snapshot_date (snapshot_date),
    INDEX idx_created_at (created_at)
);
```

### Indexes
- `idx_snapshot_date`: For quick date-based queries
- `idx_created_at`: For chronological sorting

## 📱 Mobile App Features

### Tracking Screen UI

#### 1. Period Selector Card
- **Toggle Buttons**: Daily, Weekly, Monthly, Yearly
- **Visual Indicators**: Selected period highlighted in HSBC Red
- **Period Description**: Shows date range (e.g., "Last 12 Months")

#### 2. Performance Metrics Card
- **Gradient Background**: Green for gains, Red for losses
- **Period Change**: Large display with arrow indicator
- **Current vs Previous**: Side-by-side comparison
- **High/Low Values**: With dates

#### 3. Chart Visualization
- **Simple Line Chart**: Visual representation of trend
- **Color-coded bars**: Blue gradient
- **Data points**: Shows number of snapshots

#### 4. Historical Data List
- **Snapshot Cards**: Each snapshot in a card
- **Key Metrics**: Value, gain/loss, positions
- **Date Display**: Formatted date
- **Visual Indicators**: Icons and colors

### Navigation

From Dashboard:
- **Blue FAB**: Navigate to Tracking screen (chart icon)
- **Red FAB**: Navigate to Holdings screen

### Actions

In Tracking Screen:
- **Camera Icon**: Create manual snapshot
- **Refresh Icon**: Reload tracking data
- **Back Arrow**: Return to dashboard

## 🎨 UI Design

### Colors
- **Selected Period**: HSBC Red (#DB0011)
- **Positive Performance**: Green gradient
- **Negative Performance**: Red gradient
- **Charts**: Blue gradient (#1E88E5 to #0D47A1)
- **Icons**: Asset-specific colors

### Components
- **Material 3 Cards**: Rounded corners, elevation
- **Toggle Buttons**: Responsive, visual feedback
- **Gradient Cards**: Performance metrics
- **Icon Indicators**: Trending up/down arrows

## 🔄 Data Flow

### Creating a Snapshot

1. **Trigger**: Manual (camera button) or Automatic
2. **Service**: Gets current dashboard data
3. **Calculate**: Metrics and aggregations
4. **Store**: Save to database
5. **Return**: Snapshot response

### Fetching Tracking Data

1. **Select Period**: User chooses time period
2. **Calculate Range**: Determine start/end dates
3. **Query**: Fetch snapshots in range
4. **Aggregate**: Calculate performance metrics
5. **Return**: Complete tracking response

## 💡 Use Cases

### 1. Monitor Daily Performance
```
User taps "Daily" → Shows last 30 days
User sees: Daily fluctuations, trends, high/low
```

### 2. Review Monthly Trends
```
User taps "Monthly" → Shows last 12 months
User sees: Month-over-month growth, seasonal patterns
```

### 3. Long-term Analysis
```
User taps "Yearly" → Shows last 5 years
User sees: Long-term portfolio growth, major changes
```

### 4. Create Manual Snapshot
```
User taps camera icon → Snapshot created
System updates all views with new data
```

## 🛠️ Setup Instructions

### Backend Setup

1. **Run Migration**
```bash
# Migration runs automatically with Flyway
# Or manually:
mysql -u root -p portfolio_db < V2__Add_Portfolio_Tracking.sql
```

2. **Restart Backend**
```bash
cd backend
./mvnw spring-boot:run
```

3. **Create Initial Snapshot** (Optional)
```bash
curl -X POST http://localhost:8080/api/portfolio-tracking/snapshot
```

### Mobile Setup

1. **Sync Gradle**
   - Open project in Android Studio
   - Gradle syncs automatically

2. **Run App**
   - Click Run button
   - Navigate to Tracking from Dashboard

## 📊 Performance Considerations

### Backend
- **Indexed Queries**: Fast date-range searches
- **Caching**: Can add caching for frequently accessed periods
- **Batch Processing**: Consider scheduled snapshot creation

### Mobile
- **Lazy Loading**: Future enhancement for large datasets
- **Chart Optimization**: Simple visualization for performance
- **State Management**: Efficient with StateFlow

## 🔮 Future Enhancements

### Planned Features
- [ ] Advanced charting (MPAndroidChart integration)
- [ ] Export tracking data (CSV, PDF)
- [ ] Comparison views (multiple periods)
- [ ] Notifications for significant changes
- [ ] Predictive analytics
- [ ] Custom date range selection
- [ ] Benchmark comparisons
- [ ] Asset-specific tracking

### Technical Improvements
- [ ] Data compression for old snapshots
- [ ] Scheduled snapshot creation (cron job)
- [ ] Real-time updates with WebSocket
- [ ] Offline caching on mobile
- [ ] Push notifications

## 🐛 Troubleshooting

### No Data Showing
**Solution**: Create a snapshot manually
```bash
POST /api/portfolio-tracking/snapshot
```

### Old Data
**Solution**: Refresh using the refresh button

### Database Errors
**Solution**: Check migration ran successfully
```bash
mysql -u root -p portfolio_db
SHOW TABLES LIKE 'portfolio_snapshots';
```

## 📚 Code Examples

### Backend - Create Snapshot
```java
@PostMapping("/snapshot")
public ResponseEntity<PortfolioSnapshotResponse> createSnapshot() {
    PortfolioSnapshotResponse snapshot = trackingService.createSnapshot();
    return ResponseEntity.ok(snapshot);
}
```

### Mobile - Load Tracking
```kotlin
fun loadTracking(period: TrackingPeriod) {
    viewModelScope.launch {
        when (val result = repository.getTracking(period)) {
            is ApiResult.Success -> {
                _uiState.value = _uiState.value.copy(
                    trackingData = result.data
                )
            }
        }
    }
}
```

## ✅ Testing

### Backend Tests
```java
@Test
void createSnapshotShouldSaveCurrentPortfolioState() {
    // Test snapshot creation
}

@Test
void getMonthlyTrackingShouldReturnLast12Months() {
    // Test monthly tracking
}
```

### Manual Testing Checklist
- [ ] Create snapshot successfully
- [ ] Switch between periods
- [ ] View performance metrics
- [ ] See chart visualization
- [ ] Navigate back to dashboard
- [ ] Refresh updates data

## 🎉 Summary

Portfolio Tracking is now **fully implemented** with:
- ✅ Backend API with 7 endpoints
- ✅ Database schema and migration
- ✅ Mobile UI with period toggles
- ✅ Performance metrics calculation
- ✅ Chart visualization
- ✅ Complete navigation integration

**Ready to track your portfolio performance over time!** 📈🎊

