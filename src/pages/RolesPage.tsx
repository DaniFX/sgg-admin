import { useEffect, useState } from 'react'
import { rolesApi, type Role } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Shield, 
  RefreshCw, 
  Trash2, 
  Plus,
  X,
  Loader2,
  Edit2
} from 'lucide-react'

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    permissions: '',
  })

  const fetchRoles = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await rolesApi.list()
      setRoles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const resetForm = () => {
    setFormData({ id: '', name: '', description: '', permissions: '' })
    setIsCreating(false)
    setEditingRole(null)
  }

  const handleCreate = () => {
    resetForm()
    setIsCreating(true)
  }

  const handleEdit = (role: Role) => {
    setFormData({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.join(', '),
    })
    setEditingRole(role)
    setIsCreating(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const permissions = formData.permissions
        .split(',')
        .map(p => p.trim())
        .filter(p => p)
      
      const roleData = {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        permissions,
      }

      if (editingRole) {
        await rolesApi.update(editingRole.id, roleData)
      } else {
        await rolesApi.create(roleData)
      }
      
      await fetchRoles()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (roleId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo ruolo?')) return
    
    setDeleting(roleId)
    try {
      await rolesApi.delete(roleId)
      await fetchRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role')
    } finally {
      setDeleting(null)
    }
  }

  if (loading && roles.length === 0) {
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
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Gestione Ruoli</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchRoles} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Ruolo
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{role.name}</CardTitle>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(role)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(role.id)}
                  disabled={deleting === role.id}
                >
                  {deleting === role.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-500" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">{role.description || 'Nessuna descrizione'}</p>
              <div className="flex flex-wrap gap-1">
                {role.permissions.length > 0 ? (
                  role.permissions.map((perm) => (
                    <span 
                      key={perm} 
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {perm}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">Nessun permesso</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {roles.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Nessun ruolo trovato. Creane uno per iniziare.
          </CardContent>
        </Card>
      )}

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingRole ? 'Modifica Ruolo' : 'Nuovo Ruolo'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="id">ID Ruolo</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="es. admin, editor, viewer"
                    disabled={!!editingRole}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="es. Amministratore"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrizione</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrizione del ruolo"
                  />
                </div>
                <div>
                  <Label htmlFor="permissions">Permessi (separati da virgola)</Label>
                  <Input
                    id="permissions"
                    value={formData.permissions}
                    onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                    placeholder="es. read, write, delete"
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
