export function getHoldingsMetrics(holdings) {
  const totalInvested = holdings.reduce((sum, item) => sum + item.avgBuyPrice * item.quantity, 0)
  const totalValue = holdings.reduce((sum, item) => sum + item.currentPrice * item.quantity, 0)
  const totalGain = totalValue - totalInvested
  const gainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

  const byAssetType = holdings.reduce((acc, item) => {
    const key = item.assetType.toLowerCase()
    acc[key] = (acc[key] || 0) + item.currentPrice * item.quantity
    return acc
  }, {})

  const bySector = holdings.reduce((acc, item) => {
    acc[item.sector] = (acc[item.sector] || 0) + item.currentPrice * item.quantity
    return acc
  }, {})

  return {
    totalInvested,
    totalValue,
    totalGain,
    gainPct,
    byAssetType,
    bySector,
  }
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function buildPerformanceSeries(holdings) {
  const base = 180000 + holdings.length * 12000
  return [
    { name: 'Mon', value: base + 4200 },
    { name: 'Tue', value: base + 6800 },
    { name: 'Wed', value: base + 5100 },
    { name: 'Thu', value: base + 9500 },
    { name: 'Fri', value: base + 12800 },
  ]
}
