import BrandingForm from '@/components/BrandingForm'

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Configurações</h1>
        <BrandingForm initialData={null} />
      </div>
    </main>
  )
}
