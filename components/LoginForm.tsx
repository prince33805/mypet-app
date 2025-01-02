"use client";

import { useEffect, useState } from "react";

const LoginForm = () => {
  const [isFormVisible, setIsFormVisible] = useState(false); // Toggle login form
  const [isRegFormVisible, setIsRegFormVisible] = useState(false); // Toggle login form
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [username, setUsername] = useState<string>(""); // Track username
  const [password, setPassword] = useState(""); // Track password
  const [email, setEmail] = useState(""); // Track email
  const [error, setError] = useState<string | null>(null); // Track errors
  const [loading, setLoading] = useState(true); // Track loading state
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsLoggedIn(true);
    }
    setLoading(false); // Authentication check complete
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let validationError = null;
    // Username validation
    if (username.length < 3) {
      // setError("Username must be at least 2 characters long.");
      validationError = "Username must be at least 3 characters long.";
    } else if (username.length > 10) {
      setError("Username must not exceed 10 characters.");
      validationError = "Username must not exceed 10 characters.";
    }

    // Password validation
    if (password.length < 6) {
      validationError = "Password must be at least 6 characters long.";
      // setError("Password must be at least 6 characters long.");
    } else if (password.length > 20) {
      validationError = "Password must not exceed 20 characters.";
      // setError("Password must not exceed 20 characters.");
    }

    if (validationError) {
      setError(validationError);
      console.log("Validation Error:", validationError);
      return;
    }

    setLoading(true); // Show loading while registering
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, email }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to register");
        setLoading(false);
        return;
      }
      window.alert("Register Complete! Please Login");
      setLoading(false);
      setIsRegFormVisible(false); // Close register form
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }

  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Ensure username and password are provided
    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to login");
        return;
      }

      const data = await response.json();
      // Save token and username in localStorage
      localStorage.setItem("authToken", data.accessToken);
      // localStorage.setItem("username", username);

      // Update state to logged in
      setIsLoggedIn(true);
      // setUsername(username);
      setIsFormVisible(false); // Close login form
      window.location.reload();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Remove token from localStorage
    // localStorage.removeItem("username"); // Remove username
    setIsLoggedIn(false); // Update state to logged out
    setUsername("");
    window.location.reload();
  };

  if (loading) {
    return <div className="flex items-center space-x-4">
      <span className="text-black px-4 py-2">Loading...</span>
    </div>
  }

  return (
    <div>
      {!isLoggedIn ? (
        <>
          <button
            onClick={() => setIsRegFormVisible(true)}
            className="mx-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-500"
          >
            Register
          </button>

          <button
            onClick={() => setIsFormVisible(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Login
          </button>
          {isFormVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Login</h2>
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="username">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Enter your username"
                      value={username || ""}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4 relative">
                    <label className="block text-sm font-medium mb-1" htmlFor="password">
                      Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />

                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-0 bottom-2 flex items-center px-2 text-gray-500"
                    >
                      {showPassword ? (
                        <span>🙈hide</span> // Replace with an eye icon (closed)
                      ) : (
                        <span>👁️show</span> // Replace with an eye icon (open)
                      )}
                    </button>

                  </div>
                  {error && <p className="text-red-600 mb-2">{error}</p>}
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsFormVisible(false)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                    >
                      Login
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isRegFormVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Register</h2>
                <form onSubmit={handleRegister}>
                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="username"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Enter your username"
                      value={username || ""}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4 relative">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />

                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-0 bottom-2 flex items-center px-2 text-gray-500"
                    >
                      {showPassword ? (
                        <span>🙈hide</span> // Replace with an eye icon (closed)
                      ) : (
                        <span>👁️show</span> // Replace with an eye icon (open)
                      )}
                    </button>

                  </div>
                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="text-red-600 mb-2">{error}</p>}
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsRegFormVisible(false)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
                    >
                      {loading ? "Registering..." : "Register"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center space-x-4">
          <span className="text-black">Welcome!</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
