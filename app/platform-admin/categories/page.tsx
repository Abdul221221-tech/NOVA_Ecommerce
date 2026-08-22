import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCategory, deleteCategory } from '@/app/actions/category'

export default async function CategoriesPage() {
  const supabase = await createClient()
  
  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-sidebar-primary">Category Management</h1>
        <p className="text-muted-foreground">Manage the global shared taxonomy for the marketplace.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
          <CardDescription>This category will be available for all sellers to use.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCategory} className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="e.g. Electronics" />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" required placeholder="e.g. electronics" />
            </div>
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {categories?.map((cat) => (
          <Card key={cat.id} className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">{cat.name}</h3>
              <p className="text-sm text-muted-foreground">/{cat.slug}</p>
            </div>
            <form action={deleteCategory.bind(null, cat.id)}>
              <Button variant="destructive" size="sm">Delete</Button>
            </form>
          </Card>
        ))}
        {categories?.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No categories found.</p>
        )}
      </div>
    </div>
  )
}
