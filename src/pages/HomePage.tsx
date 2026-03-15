import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, RefreshCw, Server, CheckCircle, XCircle, Clock } from 'lucide-react'

interface HealthStatus {
  status: string
  timestamp: string
  services: Record<string, string>
}

export function HomePage() {
  const { user, logout } = useAuth()
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const gatewayUrl = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080'
      const response = await fetch(`${gatewayUrl}/health`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      const healthData = data.data || data
      setHealth(healthData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const getStatusIcon = (serviceStatus: string) => {
    const lowerStatus = serviceStatus?.toLowerCase()
    if (lowerStatus === 'healthy' || lowerStatus === 'ok' || lowerStatus === 'up') {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getOverallStatus = () => {
    if (!health) return 'unknown'
    const statuses = Object.values(health.services || {})
    if (statuses.every(s => s?.toLowerCase() === 'healthy' || s?.toLowerCase() === 'ok')) {
      return 'healthy'
    }
    return 'degraded'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Server className="h-6 w-6" />
            <h1 className="text-xl font-bold">SSG Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gateway Status</h2>
          <Button variant="outline" size="sm" onClick={fetchHealth} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
            <XCircle className="h-5 w-5 inline mr-2" />
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
              {getOverallStatus() === 'healthy' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : getOverallStatus() === 'degraded' ? (
                <XCircle className="h-5 w-5 text-yellow-500" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{getOverallStatus()}</div>
              <p className="text-xs text-muted-foreground">
                Last updated: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'Never'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gateway</CardTitle>
              {health?.status === 'ok' || health?.status === 'healthy' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{health?.status || 'Unknown'}</div>
              <p className="text-xs text-muted-foreground">
                {health ? 'API Gateway is running' : 'Waiting for status...'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Check</CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : '--:--:--'}
              </div>
              <p className="text-xs text-muted-foreground">Auto-refresh every 30s</p>
            </CardContent>
          </Card>
        </div>

        {health?.services && Object.keys(health.services).length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(health.services).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status || '')}
                      <span className="font-medium capitalize">{service}</span>
                    </div>
                    <span className="text-sm text-muted-foreground capitalize">{status || 'unknown'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
