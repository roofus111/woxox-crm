'use client'
import Grid from '@mui/material/Grid'
import { useSearchParams } from 'next/navigation'

// Component Imports
import AddCard from '@views/apps/manager/invoice/add/AddCard'
import AddActions from '@views/apps/manager/invoice/add/AddActions'

// Data Imports
import { getInvoiceData } from '@/app/server/actions'

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/apps/invoice` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */
/* const getInvoiceData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/apps/invoice`)

  if (!res.ok) {
    throw new Error('Failed to fetch invoice data')
  }

  return res.json()
}
 */
const InvoiceAdd = () => {
    // Vars

    const searchParams = useSearchParams()
    const id = searchParams.get('id')

    return (
        <Grid container spacing={6}>
            <Grid item xs={12} md={9}>
                <AddCard />
            </Grid>
            <Grid item xs={12} md={3}>
                <AddActions />
            </Grid>
        </Grid>
    )
}

export default InvoiceAdd
