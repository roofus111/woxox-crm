// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import UserDetails from './UserDetails'
import UserPlan from './UserPlan'

const UserLeftOverview = props => {
  console.log(props);
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <UserDetails data={props.data} />
      </Grid>
      {/* <Grid item xs={12}>
        <UserPlan />
      </Grid> */}
    </Grid>

  )
}

export default UserLeftOverview
