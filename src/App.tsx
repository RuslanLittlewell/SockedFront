import { useState } from 'react'
import './App.css'
import { ChatPage } from './Pages/ChatPage';

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const roomId = 'test-room'; // В реальном приложении это будет динамическим

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex w-full items-center justify-center bg-gradient-to-br from-purple-900 via-black to-purple-900">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <form onSubmit={handleLogin} className="relative bg-black/80 py-6 px-12 rounded-lg shadow-lg border border-purple-500/50">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800/50 text-white border border-purple-500/50 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ваше имя"
          />
          <button
            type="submit"
            className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Войти
          </button>
        </form>
      </div>
    );
  }

  return (
    <ChatPage roomId={roomId} username={username} />
  )
}

export default App
