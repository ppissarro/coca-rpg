import PhaserGame from './PhaserGame'
import DebugMenu from './components/DebugMenu'
import './App.css'

function App() {
  const handleDebugJump = (key) => {
    window.__phaserScene?.jumpToState?.(key)
  }

  return (
    <div className="app-root">
      <PhaserGame />
      <DebugMenu onDebugJump={handleDebugJump} />
    </div>
  )
}

export default App
