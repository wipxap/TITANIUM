import { useState } from "react"
import { UserLayout } from "@/components/layout"
import { DashboardCard, PremiumTable, PremiumButton } from "@/components/common"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useAuth, useAdminMachines, useCreateMachine, useUpdateMachine, useDeleteMachine } from "@/hooks"
import type { Machine } from "@/lib/api"

const muscleGroups = {
  chest: { label: "Pecho", color: "bg-red-500" },
  back: { label: "Espalda", color: "bg-blue-500" },
  shoulders: { label: "Hombros", color: "bg-yellow-500" },
  arms: { label: "Brazos", color: "bg-green-500" },
  legs: { label: "Piernas", color: "bg-purple-500" },
  core: { label: "Core", color: "bg-orange-500" },
  cardio: { label: "Cardio", color: "bg-pink-500" },
}

type MuscleGroup = keyof typeof muscleGroups

interface MachineFormData {
  name: string
  muscleGroup: MuscleGroup
  description: string
  quantity: number
}

function MachineForm({
  initialData,
  onSubmit,
  loading,
}: {
  initialData?: Partial<MachineFormData>
  onSubmit: (data: MachineFormData) => void
  loading: boolean
}) {
  const [formData, setFormData] = useState<MachineFormData>({
    name: initialData?.name || "",
    muscleGroup: initialData?.muscleGroup || "chest",
    description: initialData?.description || "",
    quantity: initialData?.quantity || 1,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Press de Banca"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="muscleGroup">Grupo Muscular</Label>
        <Select
          value={formData.muscleGroup}
          onValueChange={(value) => setFormData({ ...formData, muscleGroup: value as MuscleGroup })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(muscleGroups).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Cantidad</Label>
        <Input
          id="quantity"
          type="number"
          min={1}
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción opcional"
        />
      </div>

      <PremiumButton type="submit" className="w-full" loading={loading}>
        Guardar
      </PremiumButton>
    </form>
  )
}

export function AdminMachinesPage() {
  const { user } = useAuth()
  const { data, isLoading } = useAdminMachines()
  const createMachine = useCreateMachine()
  const updateMachine = useUpdateMachine()
  const deleteMachine = useDeleteMachine()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null)

  const machines = data?.machines || []

  // Group by muscle group
  const groupedMachines = machines.reduce((acc, machine) => {
    const group = machine.muscleGroup as MuscleGroup
    if (!acc[group]) acc[group] = []
    acc[group].push(machine)
    return acc
  }, {} as Record<MuscleGroup, Machine[]>)

  const handleCreate = async (formData: MachineFormData) => {
    await createMachine.mutateAsync(formData)
    setIsCreateOpen(false)
  }

  const handleUpdate = async (formData: MachineFormData) => {
    if (!editingMachine) return
    await updateMachine.mutateAsync({ id: editingMachine.id, data: formData })
    setEditingMachine(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta máquina?")) return
    await deleteMachine.mutateAsync(id)
  }

  const totalQuantity = machines.reduce((sum, m) => sum + m.quantity, 0)

  return (
    <UserLayout title="Máquinas - Admin" userRole={user?.role}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Máquinas</h1>
            <p className="text-muted-foreground">
              {machines.length} tipos · {totalQuantity} unidades totales
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <PremiumButton>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Máquina
              </PremiumButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Máquina</DialogTitle>
              </DialogHeader>
              <MachineForm onSubmit={handleCreate} loading={createMachine.isPending} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Machines by Group */}
        {Object.entries(groupedMachines).map(([group, groupMachines]) => (
          <DashboardCard
            key={group}
            title={
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${muscleGroups[group as MuscleGroup].color}`} />
                {muscleGroups[group as MuscleGroup].label}
                <Badge variant="outline" className="ml-2">
                  {groupMachines.length}
                </Badge>
              </div>
            }
            loading={isLoading}
          >
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <PremiumTable
                headers={["Máquina", "Cantidad", "Descripción", "Acciones"]}
                rows={groupMachines.map((machine) => [
                  <span key={machine.id} className="font-medium">
                    {machine.name}
                  </span>,
                  <Badge key={`qty-${machine.id}`} variant="secondary">
                    {machine.quantity}
                  </Badge>,
                  <span
                    key={`desc-${machine.id}`}
                    className="text-sm text-muted-foreground max-w-[200px] truncate"
                  >
                    {machine.description || "—"}
                  </span>,
                  <div key={`actions-${machine.id}`} className="flex gap-2">
                    <Dialog
                      open={editingMachine?.id === machine.id}
                      onOpenChange={(open) => !open && setEditingMachine(null)}
                    >
                      <DialogTrigger asChild>
                        <PremiumButton
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingMachine(machine)}
                        >
                          <Pencil className="h-4 w-4" />
                        </PremiumButton>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Máquina</DialogTitle>
                        </DialogHeader>
                        <MachineForm
                          initialData={{
                            name: machine.name,
                            muscleGroup: machine.muscleGroup as MuscleGroup,
                            description: machine.description || "",
                            quantity: machine.quantity,
                          }}
                          onSubmit={handleUpdate}
                          loading={updateMachine.isPending}
                        />
                      </DialogContent>
                    </Dialog>
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(machine.id)}
                      disabled={deleteMachine.isPending}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </PremiumButton>
                  </div>,
                ])}
              />
            </div>
          </DashboardCard>
        ))}

        {machines.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No hay máquinas registradas</p>
            <PremiumButton onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Primera Máquina
            </PremiumButton>
          </div>
        )}
      </div>
    </UserLayout>
  )
}
