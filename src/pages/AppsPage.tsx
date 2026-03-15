import { useEffect, useState } from 'react'
import { appsApi, type App } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  AppWindow, 
  RefreshCw, 
  Trash2, 
  Plus,
  X,
  Loader2,
  Edit2
} from 'lucide-react'

export function AppsPage() {
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingApp, setEditingApp] = useState<App | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
  })

  const fetchApps = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await appsApi.list()
      setApps(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch apps')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [])

  const resetForm = () => {
    setFormData({ id: '', name: '', description: '' })
    setIsCreating(false)
    setEditingApp(null)
  }

  const handleCreate = () => {
    resetForm()
    setIsCreating(true)
  }

  const handleEdit = (app: App) => {
    setFormData({
      id: app.id,
      name: app.name,
      description: app.description,
    })
    setEditingApp(app)
    setIsCreating(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingApp) {
        await appsApi.update(editingApp.id, formData)
      } else {
        await appsApi.create(formData)
      }
      
      await fetchApps()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save app')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (appId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa applicazione?')) return
    
    setDeleting(appId)
    try {
      await appsApi.delete(appId)
      await fetchApps()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete app')
    } finally {
      setDeleting(null)
    }
  }

  if (loading && apps.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <AppWindow className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Gestione Applicazioni</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchApps} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuova App
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <Card key={app.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{app.name}</CardTitle>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(app)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(app.id)}
                  disabled={deleting === app.id}
                >
                  {deleting === app.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-500" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-2">
                {app.description || 'Nessuna descrizione'}
              </p>
              <p className="text-xs text-gray-400">ID: {app.id}</p>
              {app.createdAt && (
                <p className="text-xs text-gray-400">
                  Creata: {new Date(app.createdAt).toLocaleDateString('it-IT')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {apps.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Nessuna applicazione trovata. Creane una per iniziare.
          </CardContent>
        </Card>
      )}

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingApp ? 'Modifica App' : 'Nuova App'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="id">ID App</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="es. ssg-admin, my-app"
                    disabled={!!editingApp}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="es. SSG Admin"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrizione</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrizione dell'applicazione"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={resetForm}>
                    Annulla
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={saving || !formData.id || !formData.name}
                  >
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Salva
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
