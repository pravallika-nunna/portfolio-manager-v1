import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'
import Overview from './pages/Overview'
import Dashboard from './pages/Dashboard'
import Holdings from './pages/Holdings'
import Transactions from './pages/Transactions'
import Watchlist from './pages/Watchlist'
import Dividends from './pages/Dividends'
import Tax from './pages/Tax'
import Profile from './pages/Profile'
import { initialPortfolioData } from './data/mockPortfolioData'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [holdings] = useState(initialPortfolioData.holdings)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <BrowserRouter>
      <AppShell
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        holdings={holdings}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        <Routes>
          <Route path="/" element={<Overview searchQuery={searchQuery} onSearch={setSearchQuery} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:assetType" element={<Dashboard />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/dividends" element={<Dividends />} />
          <Route path="/tax" element={<Tax />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
