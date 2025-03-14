import HockeyDashboard from './components/HockeyDashboard'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">Hockey Analytics Dashboard</h1>
          <p className="text-sm text-gray-600">Data: MoneyPuck.com</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4">
        <HockeyDashboard />
      </main>
    </div>
  )
}

export default App