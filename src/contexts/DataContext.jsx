import { createContext, useContext, useState } from 'react'

// Create the context
const DataContext = createContext()

// Provider component that wraps your app and makes the data available to any child component
export function DataProvider({ children }) {
  const [data1, setData] = useState('')

  // Function to update the data
  const updateData = newData => {
    setData(newData)
  }

  return <DataContext.Provider value={{ data1, updateData }}>{children}</DataContext.Provider>
}

// Custom hook to use the data context
export const useData = () => useContext(DataContext)
