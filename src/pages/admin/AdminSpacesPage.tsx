import { useState } from "react"
import { UserLayout } from "@/components/layout"
import { DashboardCard, PremiumButton } from "@/components/common"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, X } from "lucide-react"
import { useAuth, useAdminSpaces, useCreateSpace, useUpdateSpace, useDeleteSpace } from "@/hooks"
import type { Space } from "@/lib/api"

interface SpaceFormData {
  name: string
  subtitle: string
  description: string
  floorNumber: number
  imageUrl: string
  features: string[]
  sortOrder: number
  isActive: boolean
}

function SpaceForm({
  initialData,
  onSubmit,
  loading,
}: {
  initialData?: Partial<SpaceFormData>
  onSubmit: (data: SpaceFormData) => void
  loading: boolean
}) {
  const [formData, setFormData] = useState<SpaceFormData>({
    name: initialData?.name || "",
    subtitle: initialData?.subtitle || "",
    description: initialData?.description || "",
    floorNumber: initialData?.floorNumber || 1,
    imageUrl: initialData?.imageUrl || "",
    features: initialData?.features || [],
    sortOrder: initialData?.sortOrder || 0,
    isActive: initialData?.isActive ?? true,
  })
  const [featureInput, setFeatureInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addFeature = () => {
    const trimmed = featureInput.trim()
    if (!trimmed) return
    setFormData({ ...formData, features: [...formData.features, trimmed] })
    setFeatureInput("")
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Sala de Musculacion"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitulo</Label>
        <Input
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          placeholder="El corazon del gym"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripcion</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripcion del espacio..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="floorNumber">Piso</Label>
          <Input
            id="floorNumber"
            type="number"
            min={1}
            max={10}
            value={formData.floorNumber}
            onChange={(e) => setFormData({ ...formData, floorNumber: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Orden</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">URL de Imagen</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label>Features</Label>
        <div className="flex gap-2">
          <Input
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            placeholder="Ej: Maquinas de ultima generacion"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addFeature()
              }
            }}
          />
          <PremiumButton type="button" variant="outline" onClick={addFeature}>
            <Plus className="h-4 w-4" />
          </PremiumButton>
        </div>
        {formData.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.features.map((feature, i) => (
              <Badge key={i} variant="secondary" className="gap-1 pr-1">
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(i)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          id="isActive"
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        <Label htmlFor="isActive">Activo</Label>
      </div>

      <PremiumButton type="submit" className="w-full" loading={loading}>
        Guardar
      </PremiumButton>
    </form>
  )
}

export function AdminSpacesPage() {
  const { user } = useAuth()
  const { data, isLoading } = useAdminSpaces()
  const createSpace = useCreateSpace()
  const updateSpace = useUpdateSpace()
  const deleteSpace = useDeleteSpace()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSpace, setEditingSpace] = useState<Space | null>(null)

  const spaces = data?.spaces || []

  const handleCreate = async (formData: SpaceFormData) => {
    await createSpace.mutateAsync(formData)
    setIsCreateOpen(false)
  }

  const handleUpdate = async (formData: SpaceFormData) => {
    if (!editingSpace) return
    await updateSpace.mutateAsync({ id: editingSpace.id, data: formData })
    setEditingSpace(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este espacio?")) return
    await deleteSpace.mutateAsync(id)
  }

  return (
    <UserLayout title="Espacios - Admin" userRole={user?.role}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Espacios</h1>
            <p className="text-muted-foreground">
              {spaces.length} espacios registrados
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <PremiumButton>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Espacio
              </PremiumButton>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nuevo Espacio</DialogTitle>
              </DialogHeader>
              <SpaceForm onSubmit={handleCreate} loading={createSpace.isPending} />
            </DialogContent>
          </Dialog>
        </div>

        <DashboardCard title="Todos los Espacios" loading={isLoading}>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">Subtitulo</TableHead>
                  <TableHead>Piso</TableHead>
                  <TableHead className="hidden md:table-cell">Features</TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spaces.map((space) => (
                  <TableRow key={space.id}>
                    <TableCell className="font-medium">{space.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {space.subtitle || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{space.floorNumber}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{space.features?.length || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={space.isActive ? "default" : "secondary"}>
                        {space.isActive ? "Si" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog
                          open={editingSpace?.id === space.id}
                          onOpenChange={(open) => !open && setEditingSpace(null)}
                        >
                          <DialogTrigger asChild>
                            <PremiumButton
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingSpace(space)}
                            >
                              <Pencil className="h-4 w-4" />
                            </PremiumButton>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Editar Espacio</DialogTitle>
                            </DialogHeader>
                            <SpaceForm
                              initialData={{
                                name: space.name,
                                subtitle: space.subtitle || "",
                                description: space.description || "",
                                floorNumber: space.floorNumber,
                                imageUrl: space.imageUrl || "",
                                features: space.features || [],
                                sortOrder: space.sortOrder,
                                isActive: space.isActive,
                              }}
                              onSubmit={handleUpdate}
                              loading={updateSpace.isPending}
                            />
                          </DialogContent>
                        </Dialog>
                        <PremiumButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(space.id)}
                          disabled={deleteSpace.isPending}
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </PremiumButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {spaces.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay espacios registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DashboardCard>
      </div>
    </UserLayout>
  )
}
