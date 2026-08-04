import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
})

function extractApiErrorMessage(error) {
  if (error?.response?.data?.details?.length) {
    return error.response.data.details.join(', ')
  }
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  if (error?.response?.status) {
    return `Request failed with status ${error.response.status}`
  }
  return error?.message || 'Unexpected network error'
}

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(extractApiErrorMessage(error))),
)

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.message || fallback
}
