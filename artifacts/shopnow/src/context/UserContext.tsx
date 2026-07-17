import React, { createContext, useContext, useState } from "react";

interface UserContextType {
  isLoggedIn: boolean;
  userName: string;
  toggleLogin: () => void;
}

const UserContext = createContext<UserContextType>({
  isLoggedIn: true,
  userName: "Rahul",
  toggleLogin: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const toggleLogin = () => setIsLoggedIn((prev) => !prev);

  return (
    <UserContext.Provider value={{ isLoggedIn, userName: "Rahul", toggleLogin }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
