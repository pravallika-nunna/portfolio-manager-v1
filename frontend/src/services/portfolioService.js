import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  timeout: 10000,
})

export async function getDashboardSummary() {
  const response = await api.get('/dashboard')
  return response.data
}

export async function getPortfolioItems() {
  const response = await api.get('/portfolio-items')
  return response.data
}

export async function getPortfolioSummary() {
  const response = await api.get('/portfolio-items/summary')
  return response.data
}

export async function getPerformanceData() {
  const response = await api.get('/performance')
  return response.data
}
