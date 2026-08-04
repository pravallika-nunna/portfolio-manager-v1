# HSBC Portfolio Manager - Complete Project Overview

## 📁 Project Structure

```
hsbcproject/
├── backend/          # Spring Boot REST API
├── frontend/         # React Web Application
└── mobile/           # Android Mobile App
```

## 🎯 System Architecture

### Backend (Spring Boot + MySQL)
- **Technology**: Java 17, Spring Boot 3.x, MySQL
- **Port**: 8080
- **Features**:
  - RESTful API endpoints
  - Portfolio management
  - Transaction tracking
  - Dashboard analytics
  - MySQL database persistence

### Frontend (React + Vite)
- **Technology**: React 18, Vite, TailwindCSS
- **Port**: 5173 (dev)
- **Features**:
  - Modern responsive web UI
  - Dashboard with charts
  - Holdings management
  - Transaction history
  - Dividend tracking

### Mobile (Android + Jetpack Compose)
- **Technology**: Kotlin, Jetpack Compose, Material 3
- **API URL**: Configurable (10.0.2.2:8080 for emulator)
- **Features**:
  - Native Android experience
  - Beautiful Material 3 design
  - Portfolio dashboard
  - Holdings management
  - Asset type filtering

## 🚀 Getting Started

### Prerequisites
- **JDK 17** (for backend)
- **Node.js 18+** (for frontend)
- **MySQL 8.0+** (for database)
- **Android Studio** (for mobile)

### Setup Order

#### 1. Database Setup
```sql
CREATE DATABASE portfolio_db;
-- Run schema.sql from backend folder
```

#### 2. Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```
Verify: http://localhost:8080/api/portfolio-items

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Access: http://localhost:5173

#### 4. Mobile Setup
1. Open `mobile` folder in Android Studio
2. Wait for Gradle sync
3. Run on emulator or device

## 🔗 API Endpoints

### Portfolio Items
- `GET /api/portfolio-items` - List all items
- `GET /api/portfolio-items/{id}` - Get item by ID
- `POST /api/portfolio-items` - Create new item
- `PUT /api/portfolio-items/{id}` - Update item
- `DELETE /api/portfolio-items/{id}` - Delete item
- `GET /api/portfolio-items/summary` - Get summary

### Dashboard
- `GET /api/dashboard` - Combined dashboard
- `GET /api/dashboard/{assetType}` - Filtered dashboard

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Dividends
- `GET /api/dividends` - List dividends
- `POST /api/dividends` - Create dividend
- `DELETE /api/dividends/{id}` - Delete dividend
- `GET /api/dividends/total` - Get total dividends

### Watchlist
- `GET /api/watchlist` - List watchlist items
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/{id}` - Remove from watchlist

### Analytics
- `GET /api/performance` - Performance metrics
- `GET /api/risk/analysis` - Risk analysis
- `GET /api/tax/estimate` - Tax estimates

## 💾 Data Models

### PortfolioItem
```json
{
  "id": 1,
  "ticker": "AAPL",
  "quantity": 10,
  "assetType": "STOCK",
  "purchasePrice": 150.00,
  "purchaseDate": "2024-01-15"
}
```

### DashboardResponse
```json
{
  "totalPositions": 5,
  "totalQuantity": 100,
  "totalCostBasis": 15000.00,
  "estimatedTotalValue": 16500.00,
  "unrealizedGainLoss": 1500.00,
  "unrealizedGainLossPct": 10.00,
  "quantityByAssetType": {"STOCK": 80, "BOND": 20},
  "costByAssetType": {"STOCK": 12000.00, "BOND": 3000.00},
  "holdings": [...]
}
```

## 🎨 Design System

### Colors
- **Primary**: HSBC Red (#DB0011)
- **Secondary**: Blue (#1E88E5)
- **Success**: Green (#4CAF50)
- **Warning**: Orange (#FF9800)
- **Error**: Red (#F44336)
- **Info**: Blue (#2196F3)

### Asset Type Colors
- **Stock**: Blue (#1E88E5)
- **Bond**: Orange (#FF9800)
- **Crypto**: Purple (#9C27B0)

## 📱 Platform-Specific Features

### Web (Frontend)
- Advanced charts with Chart.js
- Multi-page navigation
- Tax estimation tools
- Performance analytics
- Responsive design

### Mobile (Android)
- Native performance
- Material 3 components
- Offline capability (future)
- Push notifications (future)
- Biometric auth (future)

## 🔒 Security Considerations

### Current Implementation
- CORS enabled for development
- Input validation on backend
- SQL injection protection via JPA
- Clear text traffic allowed (dev only)

### Production Recommendations
- Enable HTTPS
- Implement JWT authentication
- Add rate limiting
- Enable SQL audit logging
- Disable clear text traffic
- Add API key authentication
- Implement refresh tokens

## 📊 Database Schema

### portfolio_item
- id (BIGINT, PK, AUTO_INCREMENT)
- ticker (VARCHAR)
- quantity (INT)
- asset_type (VARCHAR)
- purchase_price (DECIMAL)
- purchase_date (DATE)

### transaction
- id (BIGINT, PK)
- portfolio_item_id (BIGINT, FK)
- transaction_type (VARCHAR)
- quantity (INT)
- price (DECIMAL)
- transaction_date (DATE)

### dividend_record
- id (BIGINT, PK)
- portfolio_item_id (BIGINT, FK)
- amount (DECIMAL)
- payment_date (DATE)

### watchlist_item
- id (BIGINT, PK)
- ticker (VARCHAR)
- target_price (DECIMAL)
- notes (TEXT)

## 🧪 Testing

### Backend
```bash
cd backend
./mvnw test
```

### Frontend
```bash
cd frontend
npm test
```

### Mobile
- Use Android Studio's test runner
- Instrumented tests on device/emulator
- Unit tests for ViewModels and Repositories

## 🚀 Deployment

### Backend (Spring Boot)
```bash
cd backend
./mvnw clean package
java -jar target/hsbcproject-0.0.1-SNAPSHOT.jar
```

### Frontend (Static Build)
```bash
cd frontend
npm run build
# Deploy 'dist' folder to web server
```

### Mobile (APK/AAB)
```bash
# In Android Studio:
Build → Generate Signed Bundle / APK
# Choose release variant
```

## 📈 Performance Tips

### Backend
- Enable JPA query caching
- Add database indexes
- Use connection pooling
- Enable compression

### Frontend
- Enable code splitting
- Optimize images
- Use lazy loading
- Enable PWA features

### Mobile
- Use R8 minification
- Enable ProGuard
- Optimize images
- Use vector drawables

## 🐛 Troubleshooting

### Backend Issues
- Check MySQL is running on port 3306
- Verify database credentials
- Check port 8080 availability

### Frontend Issues
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall
- Check backend connectivity

### Mobile Issues
- Sync Gradle files
- Clean and rebuild project
- Check Android SDK installation
- Verify emulator configuration

## 📚 Documentation

- **Backend**: `backend/README.md`
- **Frontend**: `frontend/README.md`
- **Mobile**: `mobile/README.md`, `mobile/SETUP_GUIDE.md`

## 🤝 Contributing

1. Follow existing code structure
2. Maintain MVVM pattern (mobile)
3. Use meaningful commit messages
4. Test before committing
5. Update documentation

## 📝 License

Proprietary - HSBC Portfolio Management System

## 👥 Team

- Backend Development: Spring Boot + MySQL
- Frontend Development: React + Vite
- Mobile Development: Android + Compose

---

**Version**: 1.0.0  
**Last Updated**: 2026-08-04

