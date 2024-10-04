// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import ChangePassword from './ChangePassword'
import TwoStepVerification from './TwoStepVerification'
import RecentDevice from './RecentDevice'
import InvoiceListTable from '../overview/InvoiceListTable'
import { getInvoiceData } from '@/app/server/actions'

const SecurityTab = ({ props }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <InvoiceListTable id={props.viewItem._id} />
      </Grid>
    </Grid>
  )
}

export default SecurityTab
