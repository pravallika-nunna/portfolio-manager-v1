# HSBC Portfolio Manager

A comprehensive portfolio management system with web, mobile, and backend components.

## 🌐 Live Deployments

- **Frontend (Web)**: https://portfolio-manager-v1.vercel.app/
- **Backend (API)**: https://portfolio-manager-v1.onrender.com

## 📱 Platforms

### 1. **Backend** - Spring Boot REST API
- Java 17 + Spring Boot 3.x
- MySQL database
- RESTful API endpoints
- Portfolio, transactions, dividends management
- Dashboard analytics

### 2. **Frontend** - React Web Application
- React 18 + Vite
- TailwindCSS styling
- Responsive design
- Interactive charts
- Modern SPA experience

### 3. **Mobile** - Android Native App ✨ NEW!
- Kotlin + Jetpack Compose
- Material 3 design
- Amazing UI with HSBC branding
- Smooth animations
- Native Android performance

## 🚀 Quick Start

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
Access: http://localhost:8080

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Access: http://localhost:5173

### Mobile
1. Open `mobile` folder in Android Studio
2. Sync Gradle files
3. Run on emulator or device

**See detailed setup guides in each folder's README**

## 📂 Project Structure

```
hsbcproject/
├── backend/           # Spring Boot API (Java)
│   ├── src/
│   ├── pom.xml
│   └── README.md
├── frontend/          # React Web App
│   ├── src/
│   ├── package.json
│   └── README.md
├── mobile/            # Android App (Kotlin)
│   ├── app/
│   ├── build.gradle
│   ├── README.md
│   ├── SETUP_GUIDE.md
│   └── QUICK_START.md
└── PROJECT_OVERVIEW.md
```

## 🎯 Features

### Portfolio Management
- Add, edit, delete holdings
- Track multiple asset types (Stocks, Bonds, Crypto)
- Real-time value calculations
- Portfolio summary and analytics

### Dashboard
- Total portfolio value
- Gain/Loss tracking
- Asset allocation breakdown
- Performance metrics

### Transactions
- Buy/sell history
- Transaction tracking
- Cost basis calculations

### Dividends
- Dividend tracking
- Total dividend income
- Payment history

### Analytics
- Performance analysis
- Risk assessment
- Tax estimation

## 🎨 Mobile App Highlights

The new Android app features:
- ✨ **Beautiful Material 3 UI** - Modern, professional design
- 🎨 **HSBC Branding** - Corporate red theme throughout
- 📊 **Dashboard Screen** - Portfolio overview with analytics
- 💼 **Holdings Management** - Add, edit, delete investments
- 🎯 **Asset Filtering** - Filter by Stock, Bond, or Crypto
- 🔄 **Real-time Sync** - Connects to backend API
- 📱 **Native Performance** - Smooth animations and transitions
- 🎭 **Color-coded Assets** - Visual indicators for asset types

### Mobile Screenshots
- Gradient dashboard cards with portfolio value
- Color-coded asset type icons (Blue for stocks, Orange for bonds, Purple for crypto)
- Beautiful add/edit dialogs with validation
- Smooth screen transitions
- Professional data visualization

## 💻 Technology Stack

| Component | Technologies |
|-----------|-------------|
| **Backend** | Java 17, Spring Boot, Spring Data JPA, MySQL, Maven |
| **Frontend** | React 18, Vite, TailwindCSS, Axios, Chart.js |
| **Mobile** | Kotlin, Jetpack Compose, Material 3, Retrofit, Coroutines, StateFlow |

## 🔌 API Endpoints

### Core Endpoints
- `GET/POST/PUT/DELETE /api/portfolio-items` - Portfolio management
- `GET /api/dashboard` - Dashboard analytics
- `GET /api/transactions` - Transaction history
- `GET /api/dividends` - Dividend records
- `GET /api/watchlist` - Watchlist items
- `GET /api/performance` - Performance metrics

**Full API documentation in backend README**

## 📱 Platform Support

| Feature | Web | Mobile |
|---------|-----|--------|
| Portfolio Dashboard | ✅ | ✅ |
| Holdings Management | ✅ | ✅ |
| Transactions | ✅ | 🔜 |
| Dividends | ✅ | 🔜 |
| Watchlist | ✅ | 🔜 |
| Analytics | ✅ | 🔜 |
| Charts | ✅ | 🔜 |

✅ Available | 🔜 Coming Soon

## 🛠️ Development

### Prerequisites
- **JDK 17** (Backend)
- **Node.js 18+** (Frontend)
- **MySQL 8.0+** (Database)
- **Android Studio** (Mobile)

### Environment Setup

1. **Database**
   ```sql
   CREATE DATABASE portfolio_db;
   -- Run schema.sql from backend folder
   ```

2. **Backend Configuration**
   - Update `application.properties` with DB credentials
   - Default port: 8080

3. **Frontend Configuration**
   - API base URL: `http://localhost:8080/api`

4. **Mobile Configuration**
   - Emulator: Uses `10.0.2.2:8080`
   - Physical device: Update IP in `app/build.gradle`

## 📚 Documentation

- [Project Overview](PROJECT_OVERVIEW.md) - Complete system architecture
- [Backend Documentation](backend/README.md) - API details
- [Frontend Documentation](frontend/README.md) - Web app guide
- [Mobile Documentation](mobile/README.md) - Android app details
- [Mobile Setup Guide](mobile/SETUP_GUIDE.md) - Detailed setup instructions
- [Mobile Quick Start](mobile/QUICK_START.md) - Quick reference

## 🎓 Learning Resources

- **Spring Boot**: https://spring.io/projects/spring-boot
- **React**: https://react.dev/
- **Jetpack Compose**: https://developer.android.com/jetpack/compose
- **Material 3**: https://m3.material.io/

## 🔒 Security Notes

**Development Mode** (Current):
- CORS enabled for local development
- Clear text traffic allowed (mobile)
- Basic input validation

**Production Recommendations**:
- Enable HTTPS
- Implement JWT authentication
- Add rate limiting
- Enable API key authentication
- Disable clear text traffic

## 🤝 Contributing

1. Choose your platform (backend/frontend/mobile)
2. Follow existing code patterns
3. Test thoroughly before committing
4. Update relevant documentation

## 📄 License

Proprietary - HSBC Portfolio Management System

## 🎉 What's New

### Version 1.0.0 - Mobile Release
- ✨ Brand new Android mobile app
- 📱 Native performance with Kotlin
- 🎨 Material 3 design system
- 💼 Complete portfolio management
- 🔄 Real-time API synchronization
- 📊 Beautiful data visualization

---

**Built with ❤️ for HSBC**

For support and questions, refer to individual component READMEs or PROJECT_OVERVIEW.md
