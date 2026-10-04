import { useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import logo from './assets/short_cloud_inventory_logo.png'
import warehouseImage from './assets/dark_warehouse.jpg'


function HomePage() {

    const [backendMessage, setBackendMessage] = useState('Checking backend...')

    useEffect(() => {
        fetch('http://127.0.0.1:8000/')
            .then((response) => response.json())
            .then((data) => {
                setBackendMessage(data.message)
            })
            .catch((error) => {
                console.error(error)
                setBackendMessage('Backend connection failed')
            })
    }, [])

    return (
        <main>
            <div className="hero">
                <img
                    src={warehouseImage}
                    className="warehouse-image"
                    alt="Warehouse inventory storage"
                />

                <div className="hero-info">
                    <p>
                        Manage inventory, track stock levels, and gain insights through
                        analytics.
                    </p>

                    <div className="hero-buttons">
                        <Link to="/dashboard">
                            <button>Get Started</button>
                        </Link>

                        <Link to="/sign-in">
                            <button>Login</button>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}

function SignInPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const navigate = useNavigate()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        try {
            const response = await fetch('http://127.0.0.1:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            })

            const data = await response.json()

            if (!response.ok) {
                alert(data.detail)
                return
            }

            localStorage.setItem('access_token', data.access_token)

            alert(data.message)
            navigate('/dashboard')

        } catch (error) {
            console.error('Login failed:', error)
            alert('Unable to connect to the server')
        }
    }

    return (
        <main>
            <h2>Sign In</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </div>

                <button type="submit">Sign In</button>
            </form>
        </main>
    )
}

function SignUpPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (password !== confirmPassword) {
            alert('Passwords do not match')
            return
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            })

            const data = await response.json()

            if (!response.ok) {
                alert(data.detail)
                return
            }

            alert(data.message)
        } catch (error) {
            console.error('Registration failed:', error)
        }
    }

    return (
        <main>
            <h2>Create Account</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </div>

                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </div>

                <div>
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                </div>

                <button type="submit">Create Account</button>
            </form>
        </main>
    )
}

function DashboardPage() {
    const [userName, setUserName] = useState('')
    const navigate = useNavigate()

    function handleLogout() {
        localStorage.removeItem('access_token')
        navigate('/sign-in')
    }

    useEffect(() => {
        const token = localStorage.getItem('access_token')

        if (!token) {
            navigate('/sign-in')
            return
        }

        fetch('http://127.0.0.1:8000/me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(async (response) => {
                if (!response.ok) {
                    localStorage.removeItem('access_token')
                    navigate('/sign-in')
                    return
                }

                const data = await response.json()
                setUserName(data.name)
            })
            .catch((error) => {
                console.error('Authentication check failed:', error)
            })
    }, [navigate])



    return (
        <main>
            <h2>Inventory Dashboard</h2>
            <p>Welcome, {userName}</p>

            <button onClick={handleLogout}>
                Log Out
            </button>
        </main>
    )
}

function App() {
    return (
        <>
            <header className="banner">
                <div className="brand">
                    <Link to="/">
                        <img
                            src={logo}
                            className="logo"
                            alt="Cloud Inventory Logo"
                        />
                    </Link>

                    <h1>Inventory Management & Analytics</h1>
                </div>

                <div className="auth-buttons">
                    <Link to="/sign-in">
                        <button className="sign-in-button">Sign In</button>
                    </Link>

                    <Link to="/sign-up">
                        <button className="sign-up-button">Sign Up</button>
                    </Link>
                </div>
            </header>

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
        </>
    )
}

export default App